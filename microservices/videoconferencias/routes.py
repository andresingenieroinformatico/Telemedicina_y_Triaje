from flask import Blueprint, request, jsonify
from config import db
from models import Sala, Sesion, Participante
from datetime import datetime

video_bp = Blueprint("video", __name__)

# ─── CREAR SALA ───────────────────────────────────────────
@video_bp.route("/salas", methods=["POST"])
def crear_sala():
    data = request.get_json()

    if not data or "nombre" not in data or "url_sala" not in data:
        return jsonify({"error": "Faltan datos requeridos (nombre, url_sala)"}), 400

    nueva_sala = Sala(
        nombre=data["nombre"],
        url_sala=data["url_sala"]
    )

    db.session.add(nueva_sala)
    db.session.commit()

    return jsonify({
        "id": nueva_sala.id,
        "nombre": nueva_sala.nombre,
        "url_sala": nueva_sala.url_sala,
        "estado": nueva_sala.estado,
        "fecha_creacion": nueva_sala.fecha_creacion
    }), 201


# ─── OBTENER SALA ─────────────────────────────────────────
@video_bp.route("/salas/<int:id>", methods=["GET"])
def obtener_sala(id):
    sala = db.session.get(Sala, id)

    if not sala:
        return jsonify({"error": "Sala no encontrada"}), 404

    return jsonify({
        "id": sala.id,
        "nombre": sala.nombre,
        "url_sala": sala.url_sala,
        "estado": sala.estado,
        "fecha_creacion": sala.fecha_creacion
    }), 200


# ─── INICIAR SESION ───────────────────────────────────────
@video_bp.route("/sesiones", methods=["POST"])
def iniciar_sesion():
    data = request.get_json()

    if not data or "sala_id" not in data:
        return jsonify({"error": "Falta el campo sala_id"}), 400

    sala = db.session.get(Sala, data["sala_id"])
    if not sala:
        return jsonify({"error": "Sala no encontrada"}), 404

    nueva_sesion = Sesion(
        sala_id=data["sala_id"]
    )

    db.session.add(nueva_sesion)
    db.session.commit()

    return jsonify({
        "id": nueva_sesion.id,
        "sala_id": nueva_sesion.sala_id,
        "fecha_inicio": nueva_sesion.fecha_inicio
    }), 201


# ─── FINALIZAR SESION ─────────────────────────────────────
@video_bp.route("/sesiones/<int:id>/finalizar", methods=["PUT"])
def finalizar_sesion(id):
    sesion = db.session.get(Sesion, id)
    if not sesion:
        return jsonify({"error": "Sesión no encontrada"}), 404

    sesion.fecha_fin = datetime.utcnow()
    db.session.commit()

    return jsonify({
        "id": sesion.id,
        "sala_id": sesion.sala_id,
        "fecha_inicio": sesion.fecha_inicio,
        "fecha_fin": sesion.fecha_fin
    }), 200


# ─── AGREGAR PARTICIPANTE ─────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes", methods=["POST"])
def agregar_participante(sesion_id):
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return jsonify({"error": "Sesión no encontrada"}), 404

    data = request.get_json()
    if not data or "usuario_id" not in data or "rol" not in data:
        return jsonify({"error": "Faltan datos requeridos (usuario_id, rol)"}), 400

    nuevo_participante = Participante(
        sesion_id=sesion_id,
        usuario_id=data["usuario_id"],
        rol=data["rol"]
    )

    db.session.add(nuevo_participante)
    db.session.commit()

    return jsonify({
        "id": nuevo_participante.id,
        "sesion_id": nuevo_participante.sesion_id,
        "usuario_id": nuevo_participante.usuario_id,
        "rol": nuevo_participante.rol
    }), 201


# ─── OBTENER PARTICIPANTES ────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes", methods=["GET"])
def obtener_participantes(sesion_id):
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return jsonify({"error": "Sesión no encontrada"}), 404

    resultado = []
    for p in sesion.participantes:
        resultado.append({
            "id": p.id,
            "sesion_id": p.sesion_id,
            "usuario_id": p.usuario_id,
            "rol": p.rol
        })

    return jsonify(resultado), 200