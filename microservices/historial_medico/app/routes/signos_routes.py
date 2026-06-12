"""
app/routes/signos_routes.py
Registro y consulta de Signos Vitales (traje automatizado y manual).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app import db
from app.models  import SignosVitales, HistorialMedico
from app.schemas import SignosVitalesSchema, SignosVitalesCreateSchema

signos_bp = Blueprint("signos", __name__)

_schema        = SignosVitalesSchema()
_schema_many   = SignosVitalesSchema(many=True)
_create_schema = SignosVitalesCreateSchema()


@signos_bp.post("/")
@jwt_required()
def registrar_signos():
    """
    Registrar nuevos signos vitales (enviado por el traje automatizado o médico).
    ---
    tags: [Signos Vitales]
    security: [{Bearer: []}]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required: [historial_id]
          properties:
            historial_id:            {type: integer}
            frecuencia_cardiaca:     {type: number, description: bpm}
            presion_sistolica:       {type: number, description: mmHg}
            presion_diastolica:      {type: number, description: mmHg}
            temperatura:             {type: number, description: Celsius}
            saturacion_oxigeno:      {type: number, description: "% SpO2"}
            frecuencia_respiratoria: {type: number, description: resp/min}
            glucosa:                 {type: number, description: mg/dL}
            peso:                    {type: number, description: kg}
            altura:                  {type: number, description: metros}
            fuente:                  {type: string, default: traje_automatizado}
    responses:
      201: {description: Signos vitales registrados}
      400: {description: Datos inválidos}
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = _create_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    HistorialMedico.query.get_or_404(validated["historial_id"], description="Historial no encontrado")

    signos = SignosVitales(**validated)
    db.session.add(signos)
    db.session.commit()
    return jsonify(_schema.dump(signos)), 201


@signos_bp.get("/historial/<int:historial_id>")
@jwt_required()
def listar_signos(historial_id):
    """
    Listar historial de signos vitales de un paciente (con paginación).
    ---
    tags: [Signos Vitales]
    security: [{Bearer: []}]
    parameters:
      - {name: historial_id, in: path,  type: integer, required: true}
      - {name: page,         in: query, type: integer, default: 1}
      - {name: per_page,     in: query, type: integer, default: 20}
    responses:
      200: {description: Lista de mediciones}
    """
    HistorialMedico.query.get_or_404(historial_id, description="Historial no encontrado")
    page     = request.args.get("page",     1,  type=int)
    per_page = request.args.get("per_page", 20, type=int)

    pag = (
        SignosVitales.query
        .filter_by(historial_id=historial_id)
        .order_by(SignosVitales.registrado_en.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "total":   pag.total,
        "paginas": pag.pages,
        "pagina":  pag.page,
        "signos":  _schema_many.dump(pag.items),
    }), 200


@signos_bp.get("/historial/<int:historial_id>/ultimo")
@jwt_required()
def ultimo_registro(historial_id):
    """
    Obtener el registro de signos vitales más reciente del paciente.
    ---
    tags: [Signos Vitales]
    security: [{Bearer: []}]
    parameters:
      - {name: historial_id, in: path, type: integer, required: true}
    responses:
      200: {description: Último registro}
      404: {description: Sin registros}
    """
    HistorialMedico.query.get_or_404(historial_id, description="Historial no encontrado")
    signos = (
        SignosVitales.query
        .filter_by(historial_id=historial_id)
        .order_by(SignosVitales.registrado_en.desc())
        .first_or_404(description="No hay registros de signos vitales para este paciente")
    )
    return jsonify(_schema.dump(signos)), 200


@signos_bp.get("/<int:signos_id>")
@jwt_required()
def obtener_signos(signos_id):
    """
    Obtener un registro específico de signos vitales.
    ---
    tags: [Signos Vitales]
    security: [{Bearer: []}]
    responses:
      200: {description: Registro de signos vitales}
    """
    signos = SignosVitales.query.get_or_404(signos_id, description="Registro no encontrado")
    return jsonify(_schema.dump(signos)), 200
