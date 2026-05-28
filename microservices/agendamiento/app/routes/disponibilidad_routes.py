from flask import Blueprint, request
from marshmallow import ValidationError

from app import db
from app.models import Medico, DisponibilidadMedico
from app.schemas import (
    disponibilidad_schema, disponibilidades_schema,
    DisponibilidadCreateSchema
)
from app.utils import success_response, error_response
from app.utils.auth import require_jwt, require_role

disponibilidad_bp = Blueprint("disponibilidad", __name__)
_create_schema = DisponibilidadCreateSchema()


@require_jwt
@disponibilidad_bp.route("/medico/<int:medico_id>", methods=["GET"])
def listar_por_medico(medico_id: int):
    """Retorna la disponibilidad semanal de un médico."""
    medico = Medico.query.get(medico_id)
    if not medico:
        return error_response("Médico no encontrado.", status_code=404)

    disponibilidades = DisponibilidadMedico.query.filter_by(
        medico_id=medico_id, activa=True
    ).order_by(DisponibilidadMedico.dia_semana).all()

    return success_response(
        data={
            "medico_id": medico_id,
            "medico": medico.nombre_completo,
            "duracion_consulta_min": medico.duracion_consulta_min,
            "disponibilidad": disponibilidades_schema.dump(disponibilidades),
        }
    )


@require_role("MEDICO", "ADMIN")
@disponibilidad_bp.route("", methods=["POST"])
def crear():
    """Registra un bloque de disponibilidad para un médico."""
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _create_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    if data["hora_fin"] <= data["hora_inicio"]:
        return error_response("hora_fin debe ser mayor que hora_inicio.")

    medico = Medico.query.get(data["medico_id"])
    if not medico:
        return error_response("Médico no encontrado.", status_code=404)

    existente = DisponibilidadMedico.query.filter_by(
        medico_id=data["medico_id"],
        dia_semana=data["dia_semana"],
        hora_inicio=data["hora_inicio"],
    ).first()
    if existente:
        return error_response("Ya existe disponibilidad para ese día y hora.", status_code=409)

    disponibilidad = DisponibilidadMedico(**data)
    db.session.add(disponibilidad)
    db.session.commit()

    return success_response(
        data=disponibilidad_schema.dump(disponibilidad),
        message="Disponibilidad registrada.",
        status_code=201
    )


@require_role("MEDICO", "ADMIN")
@disponibilidad_bp.route("/<int:disponibilidad_id>", methods=["DELETE"])
def eliminar(disponibilidad_id: int):
    """Desactiva un bloque de disponibilidad."""
    disp = DisponibilidadMedico.query.get(disponibilidad_id)
    if not disp:
        return error_response("Disponibilidad no encontrada.", status_code=404)

    disp.activa = False
    db.session.commit()

    return success_response(message="Disponibilidad desactivada.")
