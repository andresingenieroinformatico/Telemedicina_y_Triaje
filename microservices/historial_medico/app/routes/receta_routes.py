from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Receta
from app.schemas import RecetaSchema, RecetaCreateSchema

receta_bp = Blueprint("recetas", __name__)

@receta_bp.post("/")
@jwt_required()
def crear():
    """
    Agregar una receta a un historial médico.
    ---
    tags: [Recetas]
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_historial
            - medicamento
            - dosis
          properties:
            id_historial:
              type: string
            medicamento:
              type: string
            dosis:
              type: string
            indicaciones:
              type: string
            duracion:
              type: string
    responses:
      201:
        description: Receta creada
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = RecetaCreateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    receta = Receta(**validated)
    db.session.add(receta)
    db.session.commit()
    return jsonify(RecetaSchema().dump(receta)), 201


@receta_bp.get("/historial/<string:id_historial>")
@jwt_required()
def listar_por_historial(id_historial):
    """
    Listar recetas de un historial.
    ---
    tags: [Recetas]
    security:
      - Bearer: []
    parameters:
      - name: id_historial
        in: path
        type: string
        required: true
    responses:
      200:
        description: Lista de recetas
    """
    recetas = Receta.query.filter_by(id_historial=id_historial).order_by(Receta.created_at.desc()).all()
    return jsonify(RecetaSchema(many=True).dump(recetas)), 200


@receta_bp.delete("/<string:id_receta>")
@jwt_required()
def eliminar(id_receta):
    """
    Eliminar una receta.
    ---
    tags: [Recetas]
    security:
      - Bearer: []
    parameters:
      - name: id_receta
        in: path
        type: string
        required: true
    responses:
      200:
        description: Receta eliminada
    """
    receta = Receta.query.get_or_404(id_receta, description="Receta no encontrada")
    db.session.delete(receta)
    db.session.commit()
    return jsonify({"mensaje": "Receta eliminada"}), 200
