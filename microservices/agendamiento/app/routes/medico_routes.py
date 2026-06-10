from flask import Blueprint, request
from marshmallow import ValidationError

from app import db
from app.models import Medico, Especialidad
from app.schemas import medico_schema, medicos_schema, MedicoCreateSchema
from app.utils import success_response, error_response, paginate_query
from app.utils.auth import require_jwt, require_role

medico_bp = Blueprint("medicos", __name__)
_create_schema = MedicoCreateSchema()


@medico_bp.route("", methods=["GET"])
@require_jwt
def listar():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    especialidad_id = request.args.get("especialidad_id", type=int)

    query = Medico.query.filter_by(activo=True)
    if especialidad_id:
        query = query.filter_by(especialidad_id=especialidad_id)
    query = query.order_by(Medico.apellidos)

    return success_response(data=paginate_query(query, page, per_page, medicos_schema))


@medico_bp.route("", methods=["POST"])
@require_role("ADMIN")
def crear():
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")
    try:
        data = _create_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    if not Especialidad.query.get(data["especialidad_id"]):
        return error_response("Especialidad no encontrada.", status_code=404)
    if Medico.query.filter_by(numero_registro=data["numero_registro"]).first():
        return error_response("Ya existe un médico con ese número de registro.", status_code=409)
    if Medico.query.filter_by(email=data["email"]).first():
        return error_response("Ya existe un médico con ese email.", status_code=409)

    medico = Medico(**data)
    db.session.add(medico)
    db.session.commit()
    return success_response(data=medico_schema.dump(medico), message="Médico registrado.", status_code=201)


@medico_bp.route("/<int:medico_id>", methods=["GET"])
@require_jwt
def detalle(medico_id: int):
    medico = Medico.query.get(medico_id)
    if not medico:
        return error_response("Médico no encontrado.", status_code=404)
    return success_response(data=medico_schema.dump(medico))


@medico_bp.route("/<int:medico_id>", methods=["PUT"])
@require_role("ADMIN")
def actualizar(medico_id: int):
    medico = Medico.query.get(medico_id)
    if not medico:
        return error_response("Médico no encontrado.", status_code=404)
    json_data = request.get_json() or {}
    for campo in ("nombres", "apellidos", "telefono", "duracion_consulta_min", "tarifa_consulta"):
        if campo in json_data:
            setattr(medico, campo, json_data[campo])
    db.session.commit()
    return success_response(data=medico_schema.dump(medico), message="Médico actualizado.")
