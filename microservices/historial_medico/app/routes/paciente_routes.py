from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Paciente
from app.schemas import PacienteSchema, PacienteCreateSchema

paciente_bp = Blueprint("pacientes", __name__)

@paciente_bp.get("/")
@jwt_required()
def listar():
    """
    Listar todos los pacientes.
    ---
    tags: [Pacientes]
    security:
      - Bearer: []
    parameters:
      - name: buscar
        in: query
        type: string
        description: Buscar por documento
    responses:
      200:
        description: Lista de pacientes
    """
    buscar = request.args.get("buscar", "")
    query  = Paciente.query
    if buscar:
        query = query.filter(Paciente.documento.ilike(f"%{buscar}%"))
    pacientes = query.order_by(Paciente.created_at.desc()).all()
    return jsonify(PacienteSchema(many=True).dump(pacientes)), 200


@paciente_bp.post("/")
@jwt_required()
def crear():
    """
    Registrar un nuevo paciente.
    ---
    tags: [Pacientes]
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
            - documento
            - fecha_nacimiento
          properties:
            id_usuario:
              type: string
            documento:
              type: string
            fecha_nacimiento:
              type: string
            genero:
              type: string
            telefono:
              type: string
            direccion:
              type: string
    responses:
      201:
        description: Paciente creado
      409:
        description: Documento duplicado
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = PacienteCreateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    if Paciente.query.filter_by(documento=validated["documento"]).first():
        return jsonify({"error": "El documento ya está registrado"}), 409

    paciente = Paciente(**validated)
    db.session.add(paciente)
    db.session.commit()
    return jsonify(PacienteSchema().dump(paciente)), 201


@paciente_bp.get("/<string:id_paciente>")
@jwt_required()
def obtener(id_paciente):
    """
    Obtener un paciente por ID.
    ---
    tags: [Pacientes]
    security:
      - Bearer: []
    parameters:
      - name: id_paciente
        in: path
        type: string
        required: true
    responses:
      200:
        description: Datos del paciente
      404:
        description: No encontrado
    """
    p = Paciente.query.get_or_404(id_paciente, description="Paciente no encontrado")
    return jsonify(PacienteSchema().dump(p)), 200


@paciente_bp.put("/<string:id_paciente>")
@jwt_required()
def actualizar(id_paciente):
    """
    Actualizar datos de un paciente.
    ---
    tags: [Pacientes]
    security:
      - Bearer: []
    parameters:
      - name: id_paciente
        in: path
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            telefono:
              type: string
            direccion:
              type: string
            genero:
              type: string
    responses:
      200:
        description: Paciente actualizado
    """
    p = Paciente.query.get_or_404(id_paciente, description="Paciente no encontrado")
    data = request.get_json(silent=True) or {}
    for campo in ["telefono", "direccion", "genero"]:
        if campo in data:
            setattr(p, campo, data[campo])
    db.session.commit()
    return jsonify(PacienteSchema().dump(p)), 200


@paciente_bp.get("/<string:id_paciente>/historial")
@jwt_required()
def historial_paciente(id_paciente):
    """
    Ver historial médico completo de un paciente.
    ---
    tags: [Pacientes]
    security:
      - Bearer: []
    parameters:
      - name: id_paciente
        in: path
        type: string
        required: true
    responses:
      200:
        description: Historial del paciente
    """
    from app.schemas import HistorialSchema
    p = Paciente.query.get_or_404(id_paciente, description="Paciente no encontrado")
    historiales = p.historiales.order_by(db.text("fecha DESC")).all()
    return jsonify(HistorialSchema(many=True).dump(historiales)), 200
