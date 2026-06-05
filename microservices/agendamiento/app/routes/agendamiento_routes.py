"""
Rutas del módulo de Agendamientos.
Plataforma de Telemedicina y Triaje Automatizado.

Endpoints:
  GET    /api/v1/agendamientos                  - Listar con filtros
  POST   /api/v1/agendamientos                  - Crear agendamiento
  GET    /api/v1/agendamientos/<id>             - Detalle
  PATCH  /api/v1/agendamientos/<id>/estado      - Cambiar estado
  DELETE /api/v1/agendamientos/<id>             - Cancelar (soft)
  GET    /api/v1/agendamientos/<id>/historial   - Historial de cambios
  GET    /api/v1/agendamientos/slots            - Slots disponibles
  GET    /api/v1/agendamientos/codigo/<codigo>  - Buscar por código
"""
from datetime import date

from flask import Blueprint, request
from marshmallow import ValidationError

from app.models import Agendamiento, HistorialAgendamiento
from app.schemas import (
    agendamiento_schema,
    agendamientos_list_schema,
    historial_schema,
    AgendamientoCreateSchema,
    AgendamientoUpdateEstadoSchema,
)
from app.services import (
    crear_agendamiento,
    cambiar_estado,
    obtener_slots_disponibles,
    listar_agendamientos,
)
from app.utils import success_response, error_response, paginate_query
from app.utils.auth import require_jwt

agendamiento_bp = Blueprint("agendamientos", __name__)

_create_schema = AgendamientoCreateSchema()
_update_estado_schema = AgendamientoUpdateEstadoSchema()


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/agendamientos  →  Listado paginado con filtros
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("", methods=["GET"])
@require_jwt
def listar():
    """
    Listar agendamientos con filtros opcionales.

    Query params:
      - paciente_id, medico_id, estado, nivel_triaje, modalidad
      - fecha_inicio (YYYY-MM-DD), fecha_fin (YYYY-MM-DD)
      - page (default 1), per_page (default 20, max 100)
    """
    filtros = {}
    for campo in ("paciente_id", "medico_id"):
        val = request.args.get(campo, type=int)
        if val:
            filtros[campo] = val
    for campo in ("estado", "nivel_triaje", "modalidad"):
        val = request.args.get(campo)
        if val:
            filtros[campo] = val.upper()
    for campo in ("fecha_inicio", "fecha_fin"):
        val = request.args.get(campo)
        if val:
            try:
                filtros[campo] = date.fromisoformat(val)
            except ValueError:
                return error_response(f"Formato de fecha inválido en '{campo}'. Use YYYY-MM-DD.")

    page = request.args.get("page", 1, type=int)
    per_page = min(request.args.get("per_page", 20, type=int), 100)

    query = listar_agendamientos(filtros)
    resultado = paginate_query(query, page, per_page, agendamientos_list_schema)

    return success_response(data=resultado)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/v1/agendamientos  →  Crear agendamiento
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("", methods=["POST"])
@require_jwt
def crear():
    """
    Crea un nuevo agendamiento.

    Body JSON requerido:
      - paciente_id, medico_id, fecha_cita (YYYY-MM-DD), hora_inicio (HH:MM)

    Body JSON opcional:
      - tipo_consulta, modalidad, motivo_consulta, notas_adicionales
      - nivel_triaje, puntaje_triaje
    """
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _create_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos de entrada inválidos.", errors=err.messages)

    agendamiento, error = crear_agendamiento(data)
    if error:
        return error_response(error, status_code=409)

    return success_response(
        data=agendamiento_schema.dump(agendamiento),
        message=f"Agendamiento creado exitosamente. Código: {agendamiento.codigo_cita}",
        status_code=201
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/agendamientos/<id>  →  Detalle
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/<int:agendamiento_id>", methods=["GET"])
@require_jwt
def detalle(agendamiento_id: int):
    """Retorna el detalle completo de un agendamiento."""
    agendamiento = Agendamiento.query.get(agendamiento_id)
    if not agendamiento:
        return error_response("Agendamiento no encontrado.", status_code=404)

    return success_response(data=agendamiento_schema.dump(agendamiento))


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/agendamientos/codigo/<codigo>  →  Buscar por código TM-XXXXXXXX
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/codigo/<string:codigo>", methods=["GET"])
@require_jwt
def buscar_por_codigo(codigo: str):
    """Busca un agendamiento por su código único (ej: TM-ABC12345)."""
    agendamiento = Agendamiento.query.filter_by(codigo_cita=codigo.upper()).first()
    if not agendamiento:
        return error_response(f"No se encontró agendamiento con código '{codigo}'.", status_code=404)

    return success_response(data=agendamiento_schema.dump(agendamiento))


# ─────────────────────────────────────────────────────────────────────────────
# PATCH /api/v1/agendamientos/<id>/estado  →  Cambiar estado
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/<int:agendamiento_id>/estado", methods=["PATCH"])
@require_jwt
def actualizar_estado(agendamiento_id: int):
    """
    Cambia el estado de un agendamiento.

    Estados válidos: PENDIENTE → CONFIRMADA → EN_CURSO → COMPLETADA
                     Cualquiera → CANCELADA (requiere motivo_cancelacion)
                     CONFIRMADA → NO_ASISTIO

    Body JSON:
      - estado (requerido)
      - motivo_cancelacion (requerido si estado=CANCELADA)
      - observacion, modificado_por (opcionales)
    """
    json_data = request.get_json()
    if not json_data:
        return error_response("Se requiere cuerpo JSON.")

    try:
        data = _update_estado_schema.load(json_data)
    except ValidationError as err:
        return error_response("Datos inválidos.", errors=err.messages)

    agendamiento, error = cambiar_estado(agendamiento_id, data)
    if error:
        status = 404 if "no encontrado" in error.lower() else 422
        return error_response(error, status_code=status)

    return success_response(
        data=agendamiento_schema.dump(agendamiento),
        message=f"Estado actualizado a '{agendamiento.estado}'."
    )


# ─────────────────────────────────────────────────────────────────────────────
# DELETE /api/v1/agendamientos/<id>  →  Cancelar (alias conveniente)
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/<int:agendamiento_id>", methods=["DELETE"])
@require_jwt
def cancelar(agendamiento_id: int):
    """
    Cancela un agendamiento. Requiere motivo_cancelacion en el body.
    No elimina el registro (soft cancel).
    """
    json_data = request.get_json() or {}
    motivo = json_data.get("motivo_cancelacion")
    if not motivo:
        return error_response("Se requiere 'motivo_cancelacion' para cancelar.")

    data = {
        "estado": "CANCELADA",
        "motivo_cancelacion": motivo,
        "observacion": json_data.get("observacion"),
        "modificado_por": json_data.get("modificado_por", "sistema"),
    }

    agendamiento, error = cambiar_estado(agendamiento_id, data)
    if error:
        status = 404 if "no encontrado" in error.lower() else 422
        return error_response(error, status_code=status)

    return success_response(
        data=agendamiento_schema.dump(agendamiento),
        message="Agendamiento cancelado."
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/agendamientos/<id>/historial  →  Historial de cambios
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/<int:agendamiento_id>/historial", methods=["GET"])
@require_jwt
def ver_historial(agendamiento_id: int):
    """Retorna el historial de cambios de estado de un agendamiento."""
    agendamiento = Agendamiento.query.get(agendamiento_id)
    if not agendamiento:
        return error_response("Agendamiento no encontrado.", status_code=404)

    registros = HistorialAgendamiento.query.filter_by(
        agendamiento_id=agendamiento_id
    ).order_by(HistorialAgendamiento.fecha_cambio.asc()).all()

    return success_response(
        data={
            "agendamiento_id": agendamiento_id,
            "codigo_cita": agendamiento.codigo_cita,
            "estado_actual": agendamiento.estado,
            "historial": historial_schema.dump(registros),
        }
    )


# ─────────────────────────────────────────────────────────────────────────────
# GET /api/v1/agendamientos/slots?medico_id=X&fecha=YYYY-MM-DD
# ─────────────────────────────────────────────────────────────────────────────
@agendamiento_bp.route("/slots", methods=["GET"])
@require_jwt
def slots_disponibles():
    """
    Retorna los slots de tiempo disponibles para un médico en una fecha.

    Query params:
      - medico_id (requerido)
      - fecha YYYY-MM-DD (requerido, no puede ser pasada)
    """
    medico_id = request.args.get("medico_id", type=int)
    fecha_str = request.args.get("fecha")

    if not medico_id:
        return error_response("Se requiere 'medico_id'.")
    if not fecha_str:
        return error_response("Se requiere 'fecha' (YYYY-MM-DD).")

    try:
        fecha = date.fromisoformat(fecha_str)
    except ValueError:
        return error_response("Formato de fecha inválido. Use YYYY-MM-DD.")

    if fecha < date.today():
        return error_response("La fecha no puede ser en el pasado.")

    slots = obtener_slots_disponibles(medico_id, fecha)
    if not slots:
        return success_response(
            data={"medico_id": medico_id, "fecha": fecha_str, "slots": []},
            message="El médico no tiene disponibilidad configurada para esa fecha."
        )

    disponibles = sum(1 for s in slots if s["disponible"])
    return success_response(
        data={
            "medico_id": medico_id,
            "fecha": fecha_str,
            "total_slots": len(slots),
            "slots_disponibles": disponibles,
            "slots_ocupados": len(slots) - disponibles,
            "slots": slots,
        }
    )
