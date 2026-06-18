from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError
from app import db
from app.models import Cita
from app.schemas import CitaSchema, CitaCreateSchema, CitaUpdateSchema

cita_bp = Blueprint("citas", __name__)

@cita_bp.post("/")
@jwt_required()
def crear():
    """
    Agendar una nueva cita médica.
    ---
    tags: [Citas]
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
            - fecha_cita
          properties:
            id_paciente:
              type: string
            id_medico:
              type: string
            fecha_cita:
              type: string
            motivo:
              type: string
            estado:
              type: string
    responses:
      201:
        description: Cita agendada
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = CitaCreateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    cita = Cita(**validated)
    db.session.add(cita)
    db.session.commit()
    return jsonify(CitaSchema().dump(cita)), 201


@cita_bp.get("/paciente/<string:id_paciente>")
@jwt_required()
def listar_por_paciente(id_paciente):
    """
    Listar citas de un paciente.
    ---
    tags: [Citas]
    security:
      - Bearer: []
    parameters:
      - name: id_paciente
        in: path
        type: string
        required: true
    responses:
      200:
        description: Lista de citas del paciente
    """
    citas = Cita.query.filter_by(id_paciente=id_paciente).order_by(Cita.fecha_cita.desc()).all()
    return jsonify(CitaSchema(many=True).dump(citas)), 200


@cita_bp.get("/medico/<string:id_medico>")
@jwt_required()
def listar_por_medico(id_medico):
    """
    Listar citas de un médico.
    ---
    tags: [Citas]
    security:
      - Bearer: []
    parameters:
      - name: id_medico
        in: path
        type: string
        required: true
    responses:
      200:
        description: Lista de citas del médico
    """
    citas = Cita.query.filter_by(id_medico=id_medico).order_by(Cita.fecha_cita.asc()).all()
    return jsonify(CitaSchema(many=True).dump(citas)), 200


@cita_bp.put("/<string:id_cita>")
@jwt_required()
def actualizar(id_cita):
    """
    Actualizar estado o datos de una cita.
    ---
    tags: [Citas]
    security:
      - Bearer: []
    parameters:
      - name: id_cita
        in: path
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            fecha_cita:
              type: string
            motivo:
              type: string
            estado:
              type: string
    responses:
      200:
        description: Cita actualizada
    """
    cita = Cita.query.get_or_404(id_cita, description="Cita no encontrada")
    data = request.get_json(silent=True) or {}
    try:
        validated = CitaUpdateSchema().load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400
    for campo, valor in validated.items():
        setattr(cita, campo, valor)
    db.session.commit()
    return jsonify(CitaSchema().dump(cita)), 200


@cita_bp.delete("/<string:id_cita>")
@jwt_required()
def cancelar(id_cita):
    """
    Cancelar una cita.
    ---
    tags: [Citas]
    security:
      - Bearer: []
    parameters:
      - name: id_cita
        in: path
        type: string
        required: true
    responses:
      200:
        description: Cita cancelada
    """
    cita = Cita.query.get_or_404(id_cita, description="Cita no encontrada")
    cita.estado = "cancelada"
    db.session.commit()
    return jsonify({"mensaje": "Cita cancelada"}), 200
