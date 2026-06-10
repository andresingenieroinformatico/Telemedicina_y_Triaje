from flask import Blueprint, request
from marshmallow import ValidationError

from app import db
from app.models import Paciente
from app.schemas import paciente_schema, pacientes_schema, PacienteCreateSchema
from app.utils import success_response, error_response, paginate_query
from app.utils.auth import require_jwt, require_role

paciente_bp = Blueprint("pacientes", __name__)
_create_schema = PacienteCreateSchema()


@paciente_bp.route("", methods=["GET"])
@require_jwt
def listar():
    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)
    query = Paciente.query.filter_by(activo=True).order_by(Paciente.apellidos)
    return success_response(data=paginate_query(query, page, per_page, pacientes_schema))


@paciente_bp.route("", methods=["POST"])
@require_role("ADMIN")
def crear():
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")
    try:
        data = _create_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    if Paciente.query.filter_by(numero_documento=data["numero_documento"]).first():
        return error_response("Ya existe un paciente con ese número de documento.", status_code=409)
    if Paciente.query.filter_by(email=data["email"]).first():
        return error_response("Ya existe un paciente con ese email.", status_code=409)

    paciente = Paciente(**data)
    db.session.add(paciente)
    db.session.commit()
    return success_response(data=paciente_schema.dump(paciente), message="Paciente registrado.", status_code=201)


@paciente_bp.route("/<int:paciente_id>", methods=["GET"])
@require_jwt
def detalle(paciente_id: int):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return error_response("Paciente no encontrado.", status_code=404)
    return success_response(data=paciente_schema.dump(paciente))


@paciente_bp.route("/documento/<string:numero_documento>", methods=["GET"])
@require_jwt
def buscar_por_documento(numero_documento: str):
    paciente = Paciente.query.filter_by(numero_documento=numero_documento).first()
    if not paciente:
        return error_response("Paciente no encontrado.", status_code=404)
    return success_response(data=paciente_schema.dump(paciente))


@paciente_bp.route("/<int:paciente_id>", methods=["PUT"])
@require_role("ADMIN")
def actualizar(paciente_id: int):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return error_response("Paciente no encontrado.", status_code=404)
    json_data = request.get_json() or {}
    campos_editables = ("nombres", "apellidos", "telefono", "direccion", "ciudad", "email")
    for campo in campos_editables:
        if campo in json_data:
            setattr(paciente, campo, json_data[campo])
    db.session.commit()
    return success_response(data=paciente_schema.dump(paciente), message="Paciente actualizado.")
