"""
app/routes/consulta_routes.py
CRUD de Consultas Médicas.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app import db
from app.models  import Consulta, HistorialMedico
from app.schemas import ConsultaSchema, ConsultaCreateSchema, ConsultaUpdateSchema, PrescripcionSchema
from app.models.medicamento import PrescripcionMedicamento

consulta_bp = Blueprint("consultas", __name__)

_schema        = ConsultaSchema()
_schema_many   = ConsultaSchema(many=True)
_create_schema = ConsultaCreateSchema()
_update_schema = ConsultaUpdateSchema()


@consulta_bp.get("/historial/<int:historial_id>")
@jwt_required()
def listar_consultas(historial_id):
    """
    Listar consultas de un historial médico.
    ---
    tags: [Consultas]
    security: [{Bearer: []}]
    parameters:
      - {name: historial_id, in: path, type: integer, required: true}
      - {name: page,         in: query, type: integer, default: 1}
      - {name: per_page,     in: query, type: integer, default: 10}
    responses:
      200: {description: Lista de consultas}
    """
    HistorialMedico.query.get_or_404(historial_id, description="Historial no encontrado")
    page     = request.args.get("page",     1,  type=int)
    per_page = request.args.get("per_page", 10, type=int)

    pag = (
        Consulta.query
        .filter_by(historial_id=historial_id)
        .order_by(Consulta.fecha_consulta.desc())
        .paginate(page=page, per_page=per_page, error_out=False)
    )

    return jsonify({
        "total":     pag.total,
        "paginas":   pag.pages,
        "pagina":    pag.page,
        "consultas": _schema_many.dump(pag.items),
    }), 200


@consulta_bp.post("/")
@jwt_required()
def crear_consulta():
    """
    Registrar una nueva consulta médica.
    ---
    tags: [Consultas]
    security: [{Bearer: []}]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required: [historial_id, medico_id, motivo]
          properties:
            historial_id: {type: integer}
            medico_id:    {type: integer}
            motivo:       {type: string}
            tipo:         {type: string, enum: [presencial, telemedicina]}
            sintomas:     {type: string}
            diagnostico:  {type: string}
            tratamiento:  {type: string}
    responses:
      201: {description: Consulta creada}
      400: {description: Datos inválidos}
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = _create_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    HistorialMedico.query.get_or_404(validated["historial_id"], description="Historial no encontrado")

    consulta = Consulta(**validated)
    db.session.add(consulta)
    db.session.commit()
    return jsonify(_schema.dump(consulta)), 201


@consulta_bp.get("/<int:consulta_id>")
@jwt_required()
def obtener_consulta(consulta_id):
    """
    Obtener una consulta por ID (incluye prescripciones).
    ---
    tags: [Consultas]
    security: [{Bearer: []}]
    parameters:
      - {name: consulta_id, in: path, type: integer, required: true}
    responses:
      200: {description: Consulta con prescripciones}
      404: {description: Consulta no encontrada}
    """
    consulta = Consulta.query.get_or_404(consulta_id, description="Consulta no encontrada")
    result   = _schema.dump(consulta)
    result["prescripciones"] = PrescripcionSchema(many=True).dump(consulta.prescripciones)
    return jsonify(result), 200


@consulta_bp.put("/<int:consulta_id>")
@jwt_required()
def actualizar_consulta(consulta_id):
    """
    Actualizar una consulta existente.
    ---
    tags: [Consultas]
    security: [{Bearer: []}]
    parameters:
      - {name: consulta_id, in: path, type: integer, required: true}
    responses:
      200: {description: Consulta actualizada}
      404: {description: Consulta no encontrada}
    """
    consulta = Consulta.query.get_or_404(consulta_id, description="Consulta no encontrada")
    data = request.get_json(silent=True) or {}
    try:
        validated = _update_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    for campo, valor in validated.items():
        setattr(consulta, campo, valor)
    db.session.commit()
    return jsonify(_schema.dump(consulta)), 200


@consulta_bp.post("/<int:consulta_id>/prescripciones")
@jwt_required()
def agregar_prescripcion(consulta_id):
    """
    Agregar un medicamento recetado a una consulta.
    ---
    tags: [Consultas]
    security: [{Bearer: []}]
    parameters:
      - {name: consulta_id, in: path, type: integer, required: true}
      - in: body
        name: body
        required: true
        schema:
          required: [medicamento_id, dosis, frecuencia]
          properties:
            medicamento_id: {type: integer}
            dosis:          {type: string}
            frecuencia:     {type: string}
            duracion:       {type: string}
            instrucciones:  {type: string}
    responses:
      201: {description: Prescripción añadida}
    """
    Consulta.query.get_or_404(consulta_id, description="Consulta no encontrada")
    data = request.get_json(silent=True) or {}
    try:
        validated = PrescripcionSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    presc = PrescripcionMedicamento(consulta_id=consulta_id, **validated)
    db.session.add(presc)
    db.session.commit()
    return jsonify(PrescripcionSchema().dump(presc)), 201
