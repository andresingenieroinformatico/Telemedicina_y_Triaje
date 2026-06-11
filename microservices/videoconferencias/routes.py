"""
routes.py – Videoconferencias API
==================================
Salas
  GET    /salas                              – Listar salas
  POST   /salas                              – Crear sala
  GET    /salas/<id>                         – Detalle de sala (con sesiones)
  PATCH  /salas/<id>/estado                  – Cambiar estado (activa | cerrada)
  DELETE /salas/<id>                         – Eliminar sala

Sesiones
  GET    /sesiones                           – Listar sesiones (filtro: sala_id, estado)
  POST   /sesiones                           – Iniciar sesión en una sala
  GET    /sesiones/<id>                      – Detalle de sesión (con participantes)
  PATCH  /sesiones/<id>/cerrar               – Finalizar sesión
  GET    /sesiones/activas                   – Sesiones activas en este momento
  GET    /salas/<sala_id>/sesiones           – Sesiones de una sala

Participantes
  GET    /sesiones/<id>/participantes        – Listar participantes de la sesión
  POST   /sesiones/<id>/participantes        – Unirse a una sesión
  PATCH  /sesiones/<id>/participantes/<uid>  – Salir de una sesión (marcar inactivo)
  DELETE /sesiones/<id>/participantes/<uid>  – Eliminar participante
"""

from flask import Blueprint, request, jsonify
from config import db
from models import Sala, Sesion, Participante
from datetime import datetime, timezone
from jitsi_service import generate_room_name, generate_jitsi_url, generate_meeting_link
from sqlalchemy.exc import SQLAlchemyError

video_bp = Blueprint("video", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _ok(data, status=200):
    return jsonify({"success": True, "data": data}), status

def _err(msg, status=400):
    return jsonify({"success": False, "error": msg}), status

def _safe_commit():
    """
    Ejecuta db.session.commit() con manejo de errores.
    Retorna None si el commit fue exitoso.
    Retorna una respuesta de error HTTP 500 si falla, haciendo rollback primero.
    """
    try:
        db.session.commit()
        return None
    except SQLAlchemyError:
        db.session.rollback()
        return _err("Error al guardar en la base de datos. Intente nuevamente.", 500)


# ═════════════════════════════════════════════════════════════════════════════
# SALAS
# ═════════════════════════════════════════════════════════════════════════════

# ─── GET /salas ───────────────────────────────────────────────────────────────
@video_bp.route("/salas", methods=["GET"])
def listar_salas():
    """
    Lista todas las salas.
    Query params opcionales:
      - estado: activa | cerrada
      - page (default 1), per_page (default 20)
    """
    estado   = request.args.get("estado")
    page     = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    query = Sala.query
    if estado:
        query = query.filter_by(estado=estado)

    paginado = query.order_by(Sala.fecha_creacion.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return _ok({
        "items":      [s.to_dict() for s in paginado.items],
        "total":      paginado.total,
        "page":       page,
        "per_page":   per_page,
        "pages":      paginado.pages,
    })


# ─── POST /salas ──────────────────────────────────────────────────────────────
@video_bp.route("/salas", methods=["POST"])
def crear_sala():
    """
    Crea una nueva sala de videoconferencia con integración Jitsi Meet.
    Body JSON requerido: nombre
    Body JSON opcional:  descripcion, capacidad_max, url_sala (si se omite, se auto-genera desde Jitsi)
    """
    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    if not data.get("nombre"):
        return _err("El campo 'nombre' es obligatorio.", 400)

    capacidad = data.get("capacidad_max", 10)
    if capacidad is not None:
        try:
            capacidad = int(capacidad)
            if capacidad <= 0:
                raise ValueError()
        except (ValueError, TypeError):
            return _err("El campo 'capacidad_max' debe ser un número entero positivo.", 400)
    else:
        capacidad = 10

    # Si se provee url_sala manualmente, verificar unicidad (backward compat)
    url_sala_manual = data.get("url_sala")
    if url_sala_manual and Sala.query.filter_by(url_sala=url_sala_manual).first():
        return _err(f"Ya existe una sala con url_sala '{url_sala_manual}'.", 409)

    # Crear sala con url_sala temporal para obtener el ID via flush
    sala = Sala(
        nombre        = data["nombre"],
        url_sala      = "__pending__",  # temporal, se sobreescribe abajo
        descripcion   = data.get("descripcion"),
        capacidad_max = capacidad,
    )
    try:
        db.session.add(sala)
        db.session.flush()  # Obtener sala.id sin hacer commit definitivo

        # Generar nombre y URL de Jitsi usando el ID real de la sala
        room_name = generate_room_name(sala.id, sala.nombre)
        sala.jitsi_room_name = room_name
        sala.url_sala = url_sala_manual or generate_jitsi_url(room_name)

        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _err("Error al crear la sala en la base de datos.", 500)

    return _ok(sala.to_dict(), 201)


# ─── GET /salas/<id> ──────────────────────────────────────────────────────────
@video_bp.route("/salas/<int:sala_id>", methods=["GET"])
def obtener_sala(sala_id):
    """Retorna el detalle de una sala incluyendo sus sesiones."""
    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)

    return _ok(sala.to_dict(include_sesiones=True))


# ─── PATCH /salas/<id>/estado ────────────────────────────────────────────────
@video_bp.route("/salas/<int:sala_id>/estado", methods=["PATCH"])
def cambiar_estado_sala(sala_id):
    """
    Cambia el estado de una sala.
    Body JSON: { "estado": "activa" | "cerrada" }
    """
    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)

    data   = request.get_json() or {}
    nuevo  = data.get("estado")
    validos = {"activa", "cerrada"}

    if not nuevo or nuevo not in validos:
        return _err(f"Estado inválido. Use uno de: {validos}.", 400)

    sala.estado = nuevo
    err = _safe_commit()
    if err:
        return err

    return _ok(sala.to_dict())


# ─── DELETE /salas/<id> ───────────────────────────────────────────────────────
@video_bp.route("/salas/<int:sala_id>", methods=["DELETE"])
def eliminar_sala(sala_id):
    """Elimina una sala y todas sus sesiones/participantes (cascade)."""
    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)

    # No se puede eliminar si hay sesiones activas
    sesion_activa = Sesion.query.filter_by(sala_id=sala_id, estado="activa").first()
    if sesion_activa:
        return _err("No se puede eliminar la sala: tiene sesiones activas.", 409)

    try:
        db.session.delete(sala)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _err("Error al eliminar la sala.", 500)

    return _ok({"mensaje": f"Sala {sala_id} eliminada correctamente."})


# ═════════════════════════════════════════════════════════════════════════════
# SESIONES
# ═════════════════════════════════════════════════════════════════════════════

# ─── GET /sesiones ────────────────────────────────────────────────────────────
@video_bp.route("/sesiones", methods=["GET"])
def listar_sesiones():
    """
    Lista sesiones con filtros opcionales.
    Query params: sala_id, estado (activa | finalizada), page, per_page
    """
    sala_id  = request.args.get("sala_id", type=int)
    estado   = request.args.get("estado")
    page     = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    query = Sesion.query
    if sala_id:
        query = query.filter_by(sala_id=sala_id)
    if estado:
        query = query.filter_by(estado=estado)

    paginado = query.order_by(Sesion.fecha_inicio.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )

    return _ok({
        "items":    [s.to_dict() for s in paginado.items],
        "total":    paginado.total,
        "page":     page,
        "per_page": per_page,
        "pages":    paginado.pages,
    })


# ─── GET /sesiones/activas ───────────────────────────────────────────────────
@video_bp.route("/sesiones/activas", methods=["GET"])
def sesiones_activas():
    """Retorna todas las sesiones con estado 'activa' en este momento."""
    sesiones = Sesion.query.filter_by(estado="activa").order_by(Sesion.fecha_inicio.desc()).all()
    return _ok([s.to_dict(include_participantes=True) for s in sesiones])


# ─── GET /salas/<sala_id>/sesiones ───────────────────────────────────────────
@video_bp.route("/salas/<int:sala_id>/sesiones", methods=["GET"])
def sesiones_de_sala(sala_id):
    """Lista todas las sesiones de una sala específica."""
    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)

    sesiones = Sesion.query.filter_by(sala_id=sala_id).order_by(Sesion.fecha_inicio.desc()).all()
    return _ok({
        "sala_id":  sala_id,
        "nombre":   sala.nombre,
        "sesiones": [s.to_dict() for s in sesiones],
        "total":    len(sesiones),
    })


# ─── POST /sesiones ───────────────────────────────────────────────────────────
@video_bp.route("/sesiones", methods=["POST"])
def iniciar_sesion():
    """
    Inicia una nueva sesión en una sala.
    Body JSON requerido: sala_id
    Reglas:
      - La sala debe existir y estar activa.
      - No puede haber ya una sesión activa en esa sala.
    """
    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    sala_id = data.get("sala_id")
    if not sala_id:
        return _err("El campo 'sala_id' es obligatorio.", 400)

    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)
    if sala.estado != "activa":
        return _err(f"La sala está '{sala.estado}' y no admite nuevas sesiones.", 409)

    sesion_existente = Sesion.query.filter_by(sala_id=sala_id, estado="activa").first()
    if sesion_existente:
        return _err(f"Ya existe una sesión activa (id={sesion_existente.id}) en esta sala.", 409)

    sesion = Sesion(sala_id=sala_id)
    db.session.add(sesion)
    err = _safe_commit()
    if err:
        return err

    return _ok(sesion.to_dict(), 201)


# ─── GET /sesiones/<id> ───────────────────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>", methods=["GET"])
def obtener_sesion(sesion_id):
    """Retorna el detalle de una sesión, incluyendo sus participantes."""
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    return _ok(sesion.to_dict(include_participantes=True))


# ─── PATCH /sesiones/<id>/cerrar ─────────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/cerrar", methods=["PATCH"])
def cerrar_sesion(sesion_id):
    """
    Finaliza una sesión activa.
    Marca fecha_fin, cambia estado a 'finalizada' y marca todos los participantes como inactivos.
    """
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    if sesion.estado == "finalizada":
        return _err("La sesión ya está finalizada.", 409)

    ahora = datetime.now(timezone.utc)
    try:
        sesion.estado    = "finalizada"
        sesion.fecha_fin = ahora

        # Marcar todos los participantes activos como salidos
        for p in sesion.participantes:
            if p.activo:
                p.activo       = False
                p.fecha_salida = ahora

        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _err("Error al cerrar la sesión.", 500)

    return _ok(sesion.to_dict(include_participantes=True))


# ═════════════════════════════════════════════════════════════════════════════
# PARTICIPANTES
# ═════════════════════════════════════════════════════════════════════════════

# ─── GET /sesiones/<id>/participantes ────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes", methods=["GET"])
def listar_participantes(sesion_id):
    """Lista los participantes de una sesión. Filtro opcional: activo=true|false"""
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    solo_activos = request.args.get("activo")
    participantes = sesion.participantes

    if solo_activos == "true":
        participantes = [p for p in participantes if p.activo]
    elif solo_activos == "false":
        participantes = [p for p in participantes if not p.activo]

    return _ok({
        "sesion_id":    sesion_id,
        "total":        len(participantes),
        "participantes": [p.to_dict() for p in participantes],
    })


# ─── POST /sesiones/<id>/participantes ───────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes", methods=["POST"])
def unirse_sesion(sesion_id):
    """
    Une a un usuario a una sesión.
    Body JSON requerido: usuario_id, rol (medico | paciente | admin)
    Body JSON opcional:  nombre_usuario
    Reglas:
      - La sesión debe estar activa.
      - Un mismo usuario no puede estar dos veces activo en la misma sesión.
      - La sala no puede superar su capacidad máxima.
    """
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    if sesion.estado != "activa":
        return _err("No se puede unir a una sesión que no está activa.", 409)

    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    usuario_id = data.get("usuario_id")
    rol        = data.get("rol")

    if not usuario_id:
        return _err("El campo 'usuario_id' es obligatorio.", 400)
    if not rol or rol not in {"medico", "paciente", "admin"}:
        return _err("El campo 'rol' es obligatorio y debe ser: medico | paciente | admin.", 400)

    # Verificar si ya está activo en la sesión
    ya_presente = Participante.query.filter_by(
        sesion_id=sesion_id, usuario_id=usuario_id, activo=True
    ).first()
    if ya_presente:
        return _err(f"El usuario {usuario_id} ya está activo en esta sesión.", 409)

    # Verificar capacidad máxima de la sala
    activos_count = Participante.query.filter_by(sesion_id=sesion_id, activo=True).count()
    if activos_count >= sesion.sala.capacidad_max:
        return _err(
            f"La sala ha alcanzado su capacidad máxima de {sesion.sala.capacidad_max} participantes.", 409
        )

    participante = Participante(
        sesion_id      = sesion_id,
        usuario_id     = usuario_id,
        nombre_usuario = data.get("nombre_usuario"),
        rol            = rol,
    )
    db.session.add(participante)
    err = _safe_commit()
    if err:
        return err

    return _ok(participante.to_dict(), 201)


# ─── PATCH /sesiones/<id>/participantes/<usuario_id> ─────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes/<int:usuario_id>", methods=["PATCH"])
def salir_sesion(sesion_id, usuario_id):
    """
    Marca a un participante como inactivo (salió de la sesión).
    No elimina el registro para conservar el historial.
    """
    participante = Participante.query.filter_by(
        sesion_id=sesion_id, usuario_id=usuario_id, activo=True
    ).first()

    if not participante:
        return _err(
            f"No se encontró un participante activo con usuario_id={usuario_id} en la sesión {sesion_id}.", 404
        )

    participante.activo       = False
    participante.fecha_salida = datetime.now(timezone.utc)
    err = _safe_commit()
    if err:
        return err

    return _ok(participante.to_dict())


# ─── DELETE /sesiones/<id>/participantes/<usuario_id> ────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/participantes/<int:usuario_id>", methods=["DELETE"])
def eliminar_participante(sesion_id, usuario_id):
    """
    Elimina permanentemente a un participante de la sesión.
    Útil para remover participantes no autorizados.
    """
    participante = Participante.query.filter_by(
        sesion_id=sesion_id, usuario_id=usuario_id
    ).first()

    if not participante:
        return _err(
            f"No se encontró al participante con usuario_id={usuario_id} en la sesión {sesion_id}.", 404
        )

    try:
        db.session.delete(participante)
        db.session.commit()
    except SQLAlchemyError:
        db.session.rollback()
        return _err("Error al eliminar el participante.", 500)

    return _ok({"mensaje": f"Participante {usuario_id} eliminado de la sesión {sesion_id}."})


# ═════════════════════════════════════════════════════════════════════════════
# JITSI MEET – LINKS DE ACCESO
# ═════════════════════════════════════════════════════════════════════════════

# ─── GET /salas/<id>/join ─────────────────────────────────────────────────────
@video_bp.route("/salas/<int:sala_id>/join", methods=["GET"])
def obtener_link_acceso_sala(sala_id):
    """
    Genera el link de acceso a Jitsi Meet para una sala.
    Devuelve la URL lista para abrir en el navegador o embeber en el frontend.

    Query params requeridos:
      - usuario_id    (int)    ID del usuario
      - rol           (str)    medico | paciente | admin
    Query params opcionales:
      - nombre_usuario (str)   Nombre a mostrar en la videollamada
    """
    sala = db.session.get(Sala, sala_id)
    if not sala:
        return _err("Sala no encontrada.", 404)
    if sala.estado != "activa":
        return _err(f"La sala está '{sala.estado}' y no está disponible para videollamadas.", 409)

    usuario_id      = request.args.get("usuario_id", type=int)
    rol             = request.args.get("rol")
    nombre_usuario  = request.args.get("nombre_usuario", "") or ""

    if not usuario_id:
        return _err("El parámetro 'usuario_id' es obligatorio.", 400)
    if not rol or rol not in {"medico", "paciente", "admin"}:
        return _err("El parámetro 'rol' es obligatorio y debe ser: medico | paciente | admin.", 400)

    meeting_info = generate_meeting_link(
        sala, usuario_id, nombre_usuario, rol
    )
    return _ok(meeting_info)


# ─── POST /sesiones/<id>/link ─────────────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/link", methods=["POST"])
def obtener_link_sesion(sesion_id):
    """
    Genera un link de acceso a Jitsi para una sesión activa específica.
    Verifica que la sesión esté activa antes de emitir el link.

    Body JSON requerido: usuario_id, rol (medico | paciente | admin)
    Body JSON opcional:  nombre_usuario
    """
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)
    if sesion.estado != "activa":
        return _err("No se puede generar link: la sesión no está activa.", 409)

    data = request.get_json()
    if not data:
        return _err("Se requiere cuerpo JSON.", 400)

    usuario_id      = data.get("usuario_id")
    rol             = data.get("rol")
    nombre_usuario  = data.get("nombre_usuario", "") or ""

    if not usuario_id:
        return _err("El campo 'usuario_id' es obligatorio.", 400)
    if not rol or rol not in {"medico", "paciente", "admin"}:
        return _err("El campo 'rol' es obligatorio y debe ser: medico | paciente | admin.", 400)

    meeting_info = generate_meeting_link(
        sesion.sala, usuario_id, nombre_usuario, rol
    )
    meeting_info["sesion_id"] = sesion_id
    return _ok(meeting_info)


# ─── PATCH /sesiones/<id>/notas ───────────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/notas", methods=["PATCH"])
def actualizar_notas_sesion(sesion_id):
    """
    Guarda o actualiza las notas clínicas de una sesión.
    Puede actualizarse tanto durante la sesión activa como después de finalizada.

    Body JSON: { "notas_sesion": "Diagnóstico: ..." }
    """
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    data = request.get_json()
    if not data or "notas_sesion" not in data:
        return _err("El campo 'notas_sesion' es obligatorio.", 400)

    sesion.notas_sesion = data["notas_sesion"]
    err = _safe_commit()
    if err:
        return err

    return _ok(sesion.to_dict(include_participantes=False))


# ─── PATCH /sesiones/<id>/grabacion ───────────────────────────────────────────
@video_bp.route("/sesiones/<int:sesion_id>/grabacion", methods=["PATCH"])
def actualizar_grabacion_sesion(sesion_id):
    """
    Guarda o actualiza la URL de la grabación de una sesión.

    Body JSON: { "grabacion_url": "https://..." }
    """
    sesion = db.session.get(Sesion, sesion_id)
    if not sesion:
        return _err("Sesión no encontrada.", 404)

    data = request.get_json()
    if not data or "grabacion_url" not in data:
        return _err("El campo 'grabacion_url' es obligatorio.", 400)

    sesion.grabacion_url = data["grabacion_url"]
    err = _safe_commit()
    if err:
        return err

    return _ok(sesion.to_dict(include_participantes=False))
