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
from marshmallow import ValidationError

from app import db
from app.models import Usuario, Paciente
from app.utils import success_response, error_response

auth_bp = Blueprint("auth", __name__)


class LoginSchema:
    """Validación simple para login."""
    def load(self, data):
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            raise ValidationError("username y password requeridos")
        return {"username": username, "password": password}


_login_schema = LoginSchema()


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
            "rol": usuario.rol,
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
                "rol": usuario.rol,
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
        "rol": usuario.rol,
        "email": usuario.email,
    })

    # Construir respuesta y setear cookie
    resp, code = success_response(
        data={"usuario": {"id": usuario.id, "username": usuario.username, "email": usuario.email, "rol": usuario.rol}},
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

    username = json_data.get("username", "").strip()
    email = json_data.get("email", "").strip()
    password = json_data.get("password", "")
    paciente_id = json_data.get("paciente_id")

    if not username or len(username) < 3:
        return error_response("username debe tener al menos 3 caracteres.")
    if not email or "@" not in email:
        return error_response("email inválido.")
    if not password or len(password) < 8:
        return error_response("password debe tener al menos 8 caracteres.")

    if Usuario.query.filter_by(username=username).first():
        return error_response("El username ya está en uso.", status_code=409)
    if Usuario.query.filter_by(email=email).first():
        return error_response("El email ya está registrado.", status_code=409)

    if paciente_id is not None:
        paciente = Paciente.query.get(paciente_id)
        if not paciente:
            return error_response("Paciente no encontrado para vincular el usuario.", status_code=404)

    usuario = Usuario(
        username=username,
        email=email,
        rol="PACIENTE",
        paciente_id=paciente_id,
    )
    usuario.set_password(password)

    db.session.add(usuario)
    db.session.commit()

    return success_response(
        data={
            "id": usuario.id,
            "username": usuario.username,
            "email": usuario.email,
            "rol": usuario.rol,
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
            "rol": usuario.rol,
            "activo": usuario.activo,
        }
    )
