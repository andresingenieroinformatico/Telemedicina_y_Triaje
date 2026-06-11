"""
Rutas de autenticación.
Maneja login, logout y tokens JWT.
"""
from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from flask_jwt_extended import set_access_cookies, unset_jwt_cookies
from marshmallow import Schema, fields, ValidationError, validate

from microservices.videoconferencias.app import db
from app import db
from app.models import Usuario, Paciente
from app.utils import success_response, error_response

auth_bp = Blueprint("auth", __name__)


class LoginSchema(Schema):
    """Esquema de validación para el inicio de sesión."""
    username = fields.String(required=True, error_messages={"required": "username es requerido"})
    password = fields.String(required=True, error_messages={"required": "password es requerido"})


class RegisterSchema(Schema):
    """Esquema de validación para el registro de pacientes."""
    username = fields.String(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=8))
    paciente_id = fields.Integer(allow_none=True)


_login_schema = LoginSchema()
_register_schema = RegisterSchema()


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Autentica un usuario y retorna token JWT.
    
    Body JSON:
    - username (requerido)
    - password (requerido)
    """
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _login_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    usuario = Usuario.query.filter_by(username=data["username"], activo=True).first()
    if not usuario or not usuario.check_password(data["password"]):
        return error_response("Credenciales inválidas.", status_code=401)

    # Crear token JWT
    access_token = create_access_token(
        identity=str(usuario.id),
        additional_claims={
            "username": usuario.username,
            "role": usuario.rol,
            "email": usuario.email,
        }
    )

    return success_response(
        data={
            "access_token": access_token,
            "usuario": {
                "id": usuario.id,
                "username": usuario.username,
                "email": usuario.email,
                "role": usuario.rol,
            }
        },
        message="Autenticación exitosa.",
        status_code=200
    )


@auth_bp.route("/login_cookie", methods=["POST"])
def login_cookie():
    """
    Login que establece el access token en una cookie HTTP-only.
    Ideal cuando el frontend usa cookies en vez de localStorage.
    """
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _login_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    usuario = Usuario.query.filter_by(username=data["username"], activo=True).first()
    if not usuario or not usuario.check_password(data["password"]):
        return error_response("Credenciales inválidas.", status_code=401)

    access_token = create_access_token(identity=str(usuario.id), additional_claims={
        "username": usuario.username,
        "role": usuario.rol,
        "email": usuario.email,
    })

    # Construir respuesta y setear cookie
    resp, code = success_response(
        data={"usuario": {"id": usuario.id, "username": usuario.username, "email": usuario.email, "role": usuario.rol}},
        message="Autenticación exitosa.",
        status_code=200,
    )
    set_access_cookies(resp, access_token)
    return resp, code


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """Elimina cookies JWT del cliente."""
    resp, code = success_response(message="Sesión cerrada.")
    unset_jwt_cookies(resp)
    return resp, code


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Registra un nuevo usuario (solo para PACIENTES).
    
    Body JSON:
    - username (requerido)
    - email (requerido)
    - password (requerido, mín 8 caracteres)
    - paciente_id (opcional, para vincular con paciente existente)
    """
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _register_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    if Usuario.query.filter_by(username=data["username"]).first():
        return error_response("El username ya está en uso.", status_code=409)
    if Usuario.query.filter_by(email=data["email"]).first():
        return error_response("El email ya está registrado.", status_code=409)

    if data.get("paciente_id") is not None:
        paciente = Paciente.query.get(data["paciente_id"])
        if not paciente:
            return error_response("Paciente no encontrado para vincular el usuario.", status_code=404)

    usuario = Usuario(
        username=data["username"],
        email=data["email"],
        rol="PACIENTE",
        paciente_id=data.get("paciente_id"),
    )
    usuario.set_password(data["password"])

    db.session.add(usuario)
    db.session.commit()

    return success_response(
        data={
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "role": usuario.rol,
        },
        message="Usuario registrado exitosamente.",
        status_code=201
    )


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    """
    Retorna información del usuario autenticado.
    Requiere JWT válido.
    """
    usuario_id = get_jwt_identity()
    if not usuario_id:
        return error_response("No autorizado.", status_code=401)

    try:
        usuario_id = int(usuario_id)
    except (TypeError, ValueError):
        return error_response("Token inválido.", status_code=401)

    usuario = Usuario.query.get(usuario_id)
    if not usuario:
        return error_response("Usuario no encontrado.", status_code=404)

    return success_response(
        data={
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "role": usuario.rol,
            "activo": usuario.activo,
        }
    )
