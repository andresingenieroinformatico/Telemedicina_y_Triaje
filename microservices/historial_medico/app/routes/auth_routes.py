from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from marshmallow import ValidationError
from app import db
from app.models import Usuario
from app.schemas import UsuarioSchema, UsuarioResponseSchema

auth_bp = Blueprint("auth", __name__)

@auth_bp.post("/registro")
def registro():
    """
    Registrar un nuevo usuario.
    ---
    tags: [Autenticación]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - nombre
            - correo
            - contrasena
            - rol
          properties:
            nombre:
              type: string
            correo:
              type: string
            contrasena:
              type: string
            rol:
              type: string
    responses:
      201:
        description: Usuario creado
      409:
        description: Correo ya registrado
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = UsuarioSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    if Usuario.query.filter_by(correo=validated["correo"]).first():
        return jsonify({"error": "El correo ya está registrado"}), 409

    usuario = Usuario(
        nombre=validated["nombre"],
        correo=validated["correo"],
        contrasena=generate_password_hash(validated["contrasena"]),
        rol=validated["rol"],
    )
    db.session.add(usuario)
    db.session.commit()
    return jsonify(UsuarioResponseSchema().dump(usuario)), 201


@auth_bp.post("/login")
def login():
    """
    Iniciar sesión y obtener token JWT.
    ---
    tags: [Autenticación]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - correo
            - contrasena
          properties:
            correo:
              type: string
            contrasena:
              type: string
    responses:
      200:
        description: Token JWT generado
      401:
        description: Credenciales inválidas
    """
    data = request.get_json(silent=True) or {}
    correo     = data.get("correo", "")
    contrasena = data.get("contrasena", "")

    usuario = Usuario.query.filter_by(correo=correo).first()
    if not usuario or not check_password_hash(usuario.contrasena, contrasena):
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity={
        "id": str(usuario.id_usuario),
        "correo": usuario.correo,
        "rol": usuario.rol,
    })
    return jsonify({
        "access_token": token,
        "tipo": "Bearer",
        "usuario": UsuarioResponseSchema().dump(usuario),
    }), 200
