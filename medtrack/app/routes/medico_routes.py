from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Medico
from app.schemas import MedicoSchema, MedicoCreateSchema

medico_bp = Blueprint("medicos", __name__)

@medico_bp.get("/")
@jwt_required()
def listar():
    """
    Listar médicos registrados.
    ---
    tags: [Médicos]
    security:
      - Bearer: []
    responses:
      200:
        description: Lista de médicos
    """
    medicos = Medico.query.order_by(Medico.especialidad).all()
    return jsonify(MedicoSchema(many=True).dump(medicos)), 200


@medico_bp.post("/")
@jwt_required()
def crear():
    """
    Registrar un nuevo médico.
    ---
    tags: [Médicos]
    security:
      - Bearer: []
    parameters:
      - in: body
        name: body
        required: true
        schema:
          type: object
          required:
            - id_usuario
            - especialidad
            - numero_colegiado
          properties:
            id_usuario:
              type: string
            especialidad:
              type: string
            numero_colegiado:
              type: string
    responses:
      201:
        description: Médico creado
      409:
        description: Número colegiado duplicado
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = MedicoCreateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    if Medico.query.filter_by(numero_colegiado=validated["numero_colegiado"]).first():
        return jsonify({"error": "Número colegiado ya registrado"}), 409

    medico = Medico(**validated)
    db.session.add(medico)
    db.session.commit()
    return jsonify(MedicoSchema().dump(medico)), 201


@medico_bp.get("/<string:id_medico>")
@jwt_required()
def obtener(id_medico):
    """
    Obtener un médico por ID.
    ---
    tags: [Médicos]
    security:
      - Bearer: []
    parameters:
      - name: id_medico
        in: path
        type: string
        required: true
    responses:
      200:
        description: Datos del médico
      404:
        description: No encontrado
    """
    m = Medico.query.get_or_404(id_medico, description="Médico no encontrado")
    return jsonify(MedicoSchema().dump(m)), 200
