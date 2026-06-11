"""
app/routes/medicamento_routes.py
CRUD del catálogo de medicamentos.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app import db
from app.models  import Medicamento
from app.schemas import MedicamentoSchema, MedicamentoCreateSchema

medicamento_bp = Blueprint("medicamentos", __name__)

_schema        = MedicamentoSchema()
_schema_many   = MedicamentoSchema(many=True)
_create_schema = MedicamentoCreateSchema()


@medicamento_bp.get("/")
@jwt_required()
def listar_medicamentos():
    """
    Listar catálogo de medicamentos.
    ---
    tags: [Medicamentos]
    security: [{Bearer: []}]
    parameters:
      - {name: buscar, in: query, type: string}
    responses:
      200: {description: Lista de medicamentos activos}
    """
    buscar = request.args.get("buscar", "", type=str)
    query  = Medicamento.query.filter_by(activo=True)
    if buscar:
        query = query.filter(Medicamento.nombre.ilike(f"%{buscar}%"))
    return jsonify(_schema_many.dump(query.order_by(Medicamento.nombre).all())), 200


@medicamento_bp.post("/")
@jwt_required()
def crear_medicamento():
    """
    Agregar un medicamento al catálogo.
    ---
    tags: [Medicamentos]
    security: [{Bearer: []}]
    responses:
      201: {description: Medicamento creado}
      409: {description: Nombre duplicado}
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = _create_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    if Medicamento.query.filter_by(nombre=validated["nombre"]).first():
        return jsonify({"error": "Medicamento ya existe en el catálogo"}), 409

    med = Medicamento(**validated)
    db.session.add(med)
    db.session.commit()
    return jsonify(_schema.dump(med)), 201


@medicamento_bp.get("/<int:med_id>")
@jwt_required()
def obtener_medicamento(med_id):
    """
    Obtener un medicamento por ID.
    ---
    tags: [Medicamentos]
    security: [{Bearer: []}]
    responses:
      200: {description: Medicamento}
      404: {description: No encontrado}
    """
    med = Medicamento.query.get_or_404(med_id, description="Medicamento no encontrado")
    return jsonify(_schema.dump(med)), 200


@medicamento_bp.delete("/<int:med_id>")
@jwt_required()
def desactivar_medicamento(med_id):
    """
    Desactivar un medicamento del catálogo (soft delete).
    ---
    tags: [Medicamentos]
    security: [{Bearer: []}]
    responses:
      200: {description: Medicamento desactivado}
    """
    med = Medicamento.query.get_or_404(med_id, description="Medicamento no encontrado")
    med.activo = False
    db.session.commit()
    return jsonify({"mensaje": "Medicamento desactivado"}), 200
