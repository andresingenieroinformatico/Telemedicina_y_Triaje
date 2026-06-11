from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app import db
from app.models import HistorialMedico
from app.schemas import HistorialSchema, HistorialCreateSchema, HistorialUpdateSchema

historial_bp = Blueprint("historial", __name__)

@historial_bp.post("/")
@jwt_required()
def crear():
    """
    Crear un registro en el historial médico.
    ---
    tags: [Historial Médico]
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_paciente
            - id_medico
          properties:
            id_paciente:
              type: string
            id_medico:
              type: string
            diagnostico:
              type: string
            tratamiento:
              type: string
            observaciones:
              type: string
    responses:
      201:
        description: Historial creado
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = HistorialCreateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    historial = HistorialMedico(**validated)
    db.session.add(historial)
    db.session.commit()
    return jsonify(HistorialSchema().dump(historial)), 201


@historial_bp.get("/<string:id_historial>")
@jwt_required()
def obtener(id_historial):
    """
    Obtener un historial médico con sus recetas.
    ---
    tags: [Historial Médico]
    security:
      - Bearer: []
    parameters:
      - name: id_historial
        in: path
        type: string
        required: true
    responses:
      200:
        description: Historial con recetas
      404:
        description: No encontrado
    """
    from app.schemas import RecetaSchema
    h = HistorialMedico.query.get_or_404(id_historial, description="Historial no encontrado")
    result = HistorialSchema().dump(h)
    result["recetas"] = RecetaSchema(many=True).dump(h.recetas.all())
    return jsonify(result), 200


@historial_bp.put("/<string:id_historial>")
@jwt_required()
def actualizar(id_historial):
    """
    Actualizar un registro del historial médico.
    ---
    tags: [Historial Médico]
    security:
      - Bearer: []
    parameters:
      - name: id_historial
        in: path
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            diagnostico:
              type: string
            tratamiento:
              type: string
            observaciones:
              type: string
    responses:
      200:
        description: Historial actualizado
    """
    h = HistorialMedico.query.get_or_404(id_historial, description="Historial no encontrado")
    data = request.get_json(silent=True) or {}
    try:
        validated = HistorialUpdateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400
    for campo, valor in validated.items():
        setattr(h, campo, valor)
    db.session.commit()
    return jsonify(HistorialSchema().dump(h)), 200


@historial_bp.delete("/<string:id_historial>")
@jwt_required()
def eliminar(id_historial):
    """
    Eliminar un registro del historial.
    ---
    tags: [Historial Médico]
    security:
      - Bearer: []
    parameters:
      - name: id_historial
        in: path
        type: string
        required: true
    responses:
      200:
        description: Historial eliminado
    """
    h = HistorialMedico.query.get_or_404(id_historial, description="Historial no encontrado")
    db.session.delete(h)
    db.session.commit()
    return jsonify({"mensaje": "Historial eliminado correctamente"}), 200
