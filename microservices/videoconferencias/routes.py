from flask import Blueprint, request, jsonify
from microservices.videoconferencias.config import db
from microservices.videoconferencias.models import Sala, Sesion, Participante
from datetime import datetime

video_bp = Blueprint("video", __name__)

# ─── CREAR SALA ───────────────────────────────────────────
@video_bp.route("/salas", methods=["POST"])
def crear_sala():
    data = request.get_json()

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
    sala = Sala.query.get(id)

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

    sala = Sala.query.get(data["sala_id"])
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