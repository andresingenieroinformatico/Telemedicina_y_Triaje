from flask import Blueprint, request
from marshmallow import ValidationError

from microservices.videoconferencias.app import db
from app.models import Especialidad
from app.schemas import especialidad_schema, especialidades_schema
from app.utils import success_response, error_response
from app.utils.auth import require_jwt, require_role

especialidad_bp = Blueprint("especialidades", __name__)


@especialidad_bp.route("", methods=["GET"])
@require_jwt
def listar():
    especialidades = Especialidad.query.filter_by(activa=True).order_by(Especialidad.nombre).all()
    return success_response(data=especialidades_schema.dump(especialidades))


@especialidad_bp.route("", methods=["POST"])
@require_role("ADMIN")
def crear():
    json_data = request.get_json()
    if not json_data or not json_data.get("nombre"):
        return error_response("Se requiere 'nombre'.")

    if Especialidad.query.filter_by(nombre=json_data["nombre"]).first():
        return error_response("La especialidad ya existe.", status_code=409)

    esp = Especialidad(
        nombre=json_data["nombre"],
        descripcion=json_data.get("descripcion"),
    )
    db.session.add(esp)
    db.session.commit()
    return success_response(data=especialidad_schema.dump(esp), message="Especialidad creada.", status_code=201)


@especialidad_bp.route("/<int:especialidad_id>", methods=["GET"])
def detalle(especialidad_id: int):
    esp = Especialidad.query.get(especialidad_id)
    if not esp:
        return error_response("Especialidad no encontrada.", status_code=404)
    return success_response(data=especialidad_schema.dump(esp))


@especialidad_bp.route("/<int:especialidad_id>", methods=["PUT"])
@require_role("ADMIN")
def actualizar(especialidad_id: int):
    esp = Especialidad.query.get(especialidad_id)
    if not esp:
        return error_response("Especialidad no encontrada.", status_code=404)
    json_data = request.get_json() or {}
    if "nombre" in json_data:
        esp.nombre = json_data["nombre"]
    if "descripcion" in json_data:
        esp.descripcion = json_data["descripcion"]
    if "activa" in json_data:
        esp.activa = json_data["activa"]
    db.session.commit()
    return success_response(data=especialidad_schema.dump(esp), message="Especialidad actualizada.")
