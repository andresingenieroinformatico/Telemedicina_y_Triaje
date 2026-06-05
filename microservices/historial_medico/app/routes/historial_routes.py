"""
app/routes/historial_routes.py
Acceso y actualización del Historial Médico.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from microservices.videoconferencias.app import db
from app.models  import HistorialMedico, Paciente
from app.schemas import HistorialSchema, HistorialUpdateSchema

historial_bp = Blueprint("historiales", __name__)

_schema        = HistorialSchema()
_update_schema = HistorialUpdateSchema()


@historial_bp.get("/paciente/<int:paciente_id>")
@jwt_required()
def obtener_historial(paciente_id):
    """
    Obtener el historial médico de un paciente.
    ---
    tags: [Historial Médico]
    security: [{Bearer: []}]
    parameters:
      - {name: paciente_id, in: path, type: integer, required: true}
    responses:
      200: {description: Historial médico completo}
      404: {description: Paciente o historial no encontrado}
    """
    Paciente.query.get_or_404(paciente_id, description="Paciente no encontrado")
    historial = HistorialMedico.query.filter_by(paciente_id=paciente_id).first_or_404(
        description="Historial no encontrado"
    )
    return jsonify(_schema.dump(historial)), 200


@historial_bp.put("/paciente/<int:paciente_id>")
@jwt_required()
def actualizar_historial(paciente_id):
    """
    Actualizar el historial médico de un paciente.
    ---
    tags: [Historial Médico]
    security: [{Bearer: []}]
    parameters:
      - {name: paciente_id, in: path, type: integer, required: true}
    responses:
      200: {description: Historial actualizado}
      400: {description: Datos inválidos}
    """
    Paciente.query.get_or_404(paciente_id, description="Paciente no encontrado")
    historial = HistorialMedico.query.filter_by(paciente_id=paciente_id).first_or_404(
        description="Historial no encontrado"
    )

    data = request.get_json(silent=True) or {}
    try:
        validated = _update_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    for campo, valor in validated.items():
        setattr(historial, campo, valor)

    db.session.commit()
    return jsonify(_schema.dump(historial)), 200


@historial_bp.get("/<int:historial_id>/resumen")
@jwt_required()
def resumen_completo(historial_id):
    """
    Resumen completo: historial + últimas consultas + últimos signos vitales.
    ---
    tags: [Historial Médico]
    security: [{Bearer: []}]
    parameters:
      - {name: historial_id, in: path, type: integer, required: true}
    responses:
      200: {description: Resumen integrado del paciente}
      404: {description: Historial no encontrado}
    """
    from app.schemas import ConsultaSchema, SignosVitalesSchema, PacienteSchema

    historial = HistorialMedico.query.get_or_404(historial_id, description="Historial no encontrado")
    paciente  = historial.paciente

    ultimas_consultas = historial.consultas.order_by(
        db.text("fecha_consulta DESC")
    ).limit(5).all()

    ultimos_signos = historial.signos.limit(5).all()

    return jsonify({
        "paciente":        PacienteSchema().dump(paciente),
        "historial":       _schema.dump(historial),
        "ultimas_consultas": ConsultaSchema(many=True).dump(ultimas_consultas),
        "ultimos_signos":    SignosVitalesSchema(many=True).dump(ultimos_signos),
    }), 200
