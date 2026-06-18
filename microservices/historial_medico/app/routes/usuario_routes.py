from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Usuario
from app.schemas import UsuarioResponseSchema

usuario_bp = Blueprint("usuarios", __name__)

@usuario_bp.get("/")
@jwt_required()
def listar():
    """
    Listar todos los usuarios.
    ---
    tags: [Usuarios]
    security:
      - Bearer: []
    responses:
      200:
        description: Lista de usuarios
    """
    usuarios = Usuario.query.order_by(Usuario.nombre).all()
    return jsonify(UsuarioResponseSchema(many=True).dump(usuarios)), 200


@usuario_bp.get("/<string:id_usuario>")
@jwt_required()
def obtener(id_usuario):
    """
    Obtener un usuario por ID.
    ---
    tags: [Usuarios]
    security:
      - Bearer: []
    parameters:
      - name: id_usuario
        in: path
        type: string
        required: true
    responses:
      200:
        description: Datos del usuario
      404:
        description: No encontrado
    """
    u = Usuario.query.get_or_404(id_usuario, description="Usuario no encontrado")
    return jsonify(UsuarioResponseSchema().dump(u)), 200
