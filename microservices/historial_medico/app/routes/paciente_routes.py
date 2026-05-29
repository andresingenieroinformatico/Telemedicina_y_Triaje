"""
app/routes/paciente_routes.py
CRUD completo de Pacientes.
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from marshmallow import ValidationError

from app import db
from app.models   import Paciente, HistorialMedico
from app.schemas  import PacienteSchema, PacienteCreateSchema, PacienteUpdateSchema

paciente_bp = Blueprint("pacientes", __name__)

_schema       = PacienteSchema()
_schema_many  = PacienteSchema(many=True)
_create_schema = PacienteCreateSchema()
_update_schema = PacienteUpdateSchema()


# ── GET /api/pacientes ─────────────────────────────────────
@paciente_bp.get("/")
@jwt_required()
def listar_pacientes():
    """
    Listar todos los pacientes activos (con paginación).
    ---
    tags: [Pacientes]
    security: [{Bearer: []}]
    parameters:
      - {name: page,     in: query, type: integer, default: 1}
      - {name: per_page, in: query, type: integer, default: 10}
      - {name: buscar,   in: query, type: string,  description: Buscar por nombre o cédula}
    responses:
      200: {description: Lista paginada de pacientes}
    """
    page     = request.args.get("page",     1,  type=int)
    per_page = request.args.get("per_page", 10, type=int)
    buscar   = request.args.get("buscar",   "",  type=str)

    query = Paciente.query.filter_by(activo=True)
    if buscar:
        like = f"%{buscar}%"
        query = query.filter(
            db.or_(
                Paciente.nombres.ilike(like),
                Paciente.apellidos.ilike(like),
                Paciente.cedula.ilike(like),
            )
        )

    pag = query.order_by(Paciente.apellidos).paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "total":    pag.total,
        "paginas":  pag.pages,
        "pagina":   pag.page,
        "por_pagina": pag.per_page,
        "pacientes": _schema_many.dump(pag.items),
    }), 200


# ── POST /api/pacientes ────────────────────────────────────
@paciente_bp.post("/")
@jwt_required()
def crear_paciente():
    """
    Crear un nuevo paciente (y su historial médico vacío).
    ---
    tags: [Pacientes]
    security: [{Bearer: []}]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          required: [cedula, nombres, apellidos, fecha_nacimiento, genero]
          properties:
            cedula:           {type: string}
            nombres:          {type: string}
            apellidos:        {type: string}
            fecha_nacimiento: {type: string, format: date}
            genero:           {type: string, enum: [M, F, Otro]}
            tipo_sangre:      {type: string}
            correo:           {type: string}
            telefono:         {type: string}
            direccion:        {type: string}
    responses:
      201: {description: Paciente creado}
      400: {description: Datos inválidos}
      409: {description: Cédula o correo ya registrado}
    """
    data = request.get_json(silent=True) or {}
    try:
        validated = _create_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    # Verificar unicidad
    if Paciente.query.filter_by(cedula=validated["cedula"]).first():
        return jsonify({"error": f"Cédula {validated['cedula']} ya registrada"}), 409

    if validated.get("correo") and Paciente.query.filter_by(correo=validated["correo"]).first():
        return jsonify({"error": f"Correo {validated['correo']} ya registrado"}), 409

    paciente = Paciente(**validated)
    db.session.add(paciente)
    db.session.flush()   # obtener ID antes del commit

    # Crear historial médico vacío automáticamente
    historial = HistorialMedico(paciente_id=paciente.id)
    db.session.add(historial)
    db.session.commit()

    return jsonify(_schema.dump(paciente)), 201


# ── GET /api/pacientes/<id> ────────────────────────────────
@paciente_bp.get("/<int:paciente_id>")
@jwt_required()
def obtener_paciente(paciente_id):
    """
    Obtener un paciente por ID.
    ---
    tags: [Pacientes]
    security: [{Bearer: []}]
    parameters:
      - {name: paciente_id, in: path, type: integer, required: true}
    responses:
      200: {description: Datos del paciente}
      404: {description: Paciente no encontrado}
    """
    paciente = Paciente.query.get_or_404(paciente_id, description="Paciente no encontrado")
    return jsonify(_schema.dump(paciente)), 200


# ── PUT /api/pacientes/<id> ────────────────────────────────
@paciente_bp.put("/<int:paciente_id>")
@jwt_required()
def actualizar_paciente(paciente_id):
    """
    Actualizar datos de un paciente.
    ---
    tags: [Pacientes]
    security: [{Bearer: []}]
    parameters:
      - {name: paciente_id, in: path, type: integer, required: true}
    responses:
      200: {description: Paciente actualizado}
      400: {description: Datos inválidos}
      404: {description: Paciente no encontrado}
    """
    paciente = Paciente.query.get_or_404(paciente_id, description="Paciente no encontrado")
    data = request.get_json(silent=True) or {}
    try:
        validated = _update_schema.load(data)
    except ValidationError as e:
        return jsonify({"errores": e.messages}), 400

    for campo, valor in validated.items():
        setattr(paciente, campo, valor)

    db.session.commit()
    return jsonify(_schema.dump(paciente)), 200


# ── DELETE /api/pacientes/<id> (soft delete) ──────────────
@paciente_bp.delete("/<int:paciente_id>")
@jwt_required()
def eliminar_paciente(paciente_id):
    """
    Desactivar un paciente (soft delete).
    ---
    tags: [Pacientes]
    security: [{Bearer: []}]
    parameters:
      - {name: paciente_id, in: path, type: integer, required: true}
    responses:
      200: {description: Paciente desactivado}
      404: {description: Paciente no encontrado}
    """
    paciente = Paciente.query.get_or_404(paciente_id, description="Paciente no encontrado")
    paciente.activo = False
    db.session.commit()
    return jsonify({"mensaje": f"Paciente {paciente_id} desactivado correctamente"}), 200
