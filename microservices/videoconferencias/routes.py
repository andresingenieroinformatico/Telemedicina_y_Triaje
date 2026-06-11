"""
routes.py – Videoconferencias API (sin base de datos)
=======================================================
Solo genera links de Jitsi Meet. Sin persistencia.

  POST  /salas/crear        – Crea (genera) una sala de Jitsi con un nombre
  POST  /salas/join         – Genera link de acceso para un usuario
  GET   /health             – Health check
"""

from flask import Blueprint, request, jsonify
from jitsi_service import generate_room_name, generate_jitsi_url, generate_meeting_link_simple

video_bp = Blueprint("video", __name__)


def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status


# ─── GET /health ──────────────────────────────────────────────────────────────
@video_bp.route("/health", methods=["GET"])
def health():
    """Health check del servicio."""
    return _ok({"status": "ok", "servicio": "videoconferencias"})


# ─── POST /salas/crear ────────────────────────────────────────────────────────
@video_bp.route("/salas/crear", methods=["POST"])
def crear_sala():
    """
    Genera los datos de una sala de Jitsi a partir de un nombre.
    Body JSON requerido: nombre
    Body JSON opcional:  sala_id (int, default=1), descripcion, capacidad_max
    """
    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    nombre = data.get("nombre")
    if not nombre:
        return _err("El campo 'nombre' es obligatorio.", 400)

    sala_id = int(data.get("sala_id", 1))
    room_name = generate_room_name(sala_id, nombre)
    url_sala = generate_jitsi_url(room_name)

    return _ok({
        "sala_id":        sala_id,
        "nombre":         nombre,
        "room_name":      room_name,
        "url_sala":       url_sala,
        "descripcion":    data.get("descripcion"),
        "capacidad_max":  data.get("capacidad_max", 10),
        "estado":         "activa",
    }, 201)


# ─── POST /salas/join ─────────────────────────────────────────────────────────
@video_bp.route("/salas/join", methods=["POST"])
def unirse_sala():
    """
    Genera el link de acceso a Jitsi para un usuario.
    Body JSON requerido: nombre_sala, usuario_id, rol (medico|paciente|admin)
    Body JSON opcional:  sala_id, nombre_usuario
    """
    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    nombre_sala    = data.get("nombre_sala")
    usuario_id     = data.get("usuario_id")
    rol            = data.get("rol")
    sala_id        = int(data.get("sala_id", 1))
    nombre_usuario = data.get("nombre_usuario", "")

    if not nombre_sala:
        return _err("El campo 'nombre_sala' es obligatorio.", 400)
    if not usuario_id:
        return _err("El campo 'usuario_id' es obligatorio.", 400)
    if not rol or rol not in {"medico", "paciente", "admin"}:
        return _err("El campo 'rol' es obligatorio y debe ser: medico | paciente | admin.", 400)

    meeting_info = generate_meeting_link_simple(
        sala_id=sala_id,
        nombre_sala=nombre_sala,
        usuario_id=int(usuario_id),
        nombre_usuario=nombre_usuario,
        rol=rol,
    )
    return _ok(meeting_info)
