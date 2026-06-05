"""
Servicio de Agendamientos - Lógica de negocio central.
Plataforma de Telemedicina y Triaje Automatizado.
"""
import random
import string
from datetime import date, time, datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import and_, or_

from microservices.videoconferencias.app import db
from app.models import (
    Agendamiento, HistorialAgendamiento,
    Medico, Paciente, DisponibilidadMedico
)


# Mapa de días de Python (weekday()) a nombres en español
DIA_SEMANA_MAP = {
    0: "LUNES",
    1: "MARTES",
    2: "MIERCOLES",
    3: "JUEVES",
    4: "VIERNES",
    5: "SABADO",
    6: "DOMINGO",
}

# Transiciones de estado permitidas
TRANSICIONES_VALIDAS = {
    "PENDIENTE":   ["CONFIRMADA", "CANCELADA"],
    "CONFIRMADA":  ["EN_CURSO", "CANCELADA", "NO_ASISTIO"],
    "EN_CURSO":    ["COMPLETADA", "CANCELADA"],
    "COMPLETADA":  [],
    "CANCELADA":   [],
    "NO_ASISTIO":  [],
}


def generar_codigo_cita() -> str:
    """Genera un código único de cita en formato TM-XXXXXX."""
    sufijo = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"TM-{sufijo}"


def _verificar_conflicto_medico(
    medico_id: int,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    excluir_id: Optional[int] = None
) -> bool:
    """
    Verifica si el médico tiene un agendamiento activo que se solape
    con el horario propuesto.
    """
    query = Agendamiento.query.filter(
        Agendamiento.medico_id == medico_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
        or_(
            and_(Agendamiento.hora_inicio <= hora_inicio, Agendamiento.hora_fin > hora_inicio),
            and_(Agendamiento.hora_inicio < hora_fin, Agendamiento.hora_fin >= hora_fin),
            and_(Agendamiento.hora_inicio >= hora_inicio, Agendamiento.hora_fin <= hora_fin),
        )
    )
    if excluir_id:
        query = query.filter(Agendamiento.id != excluir_id)
    return query.first() is not None


def _verificar_conflicto_paciente(
    paciente_id: int,
    fecha: date,
    hora_inicio: time,
    hora_fin: time,
    excluir_id: Optional[int] = None
) -> bool:
    """
    Verifica si el paciente ya tiene una cita en ese horario.
    """
    query = Agendamiento.query.filter(
        Agendamiento.paciente_id == paciente_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
        or_(
            and_(Agendamiento.hora_inicio <= hora_inicio, Agendamiento.hora_fin > hora_inicio),
            and_(Agendamiento.hora_inicio < hora_fin, Agendamiento.hora_fin >= hora_fin),
            and_(Agendamiento.hora_inicio >= hora_inicio, Agendamiento.hora_fin <= hora_fin),
        )
    )
    if excluir_id:
        query = query.filter(Agendamiento.id != excluir_id)
    return query.first() is not None


def _verificar_disponibilidad_medico(
    medico: Medico,
    fecha: date,
    hora_inicio: time,
    hora_fin: time
) -> bool:
    """
    Verifica que el médico tenga configurada disponibilidad para ese día y horario.
    """
    dia_nombre = DIA_SEMANA_MAP.get(fecha.weekday())
    disponibilidad = DisponibilidadMedico.query.filter(
        DisponibilidadMedico.medico_id == medico.id,
        DisponibilidadMedico.dia_semana == dia_nombre,
        DisponibilidadMedico.hora_inicio <= hora_inicio,
        DisponibilidadMedico.hora_fin >= hora_fin,
        DisponibilidadMedico.activa == True,  # noqa: E712
    ).first()
    return disponibilidad is not None


def crear_agendamiento(data: dict) -> tuple:
    """
    Crea un nuevo agendamiento con todas las validaciones de negocio.
    Retorna (agendamiento, error_message).
    """
    medico = Medico.query.get(data["medico_id"])
    if not medico or not medico.activo:
        return None, "Médico no encontrado o inactivo."

    paciente = Paciente.query.get(data["paciente_id"])
    if not paciente or not paciente.activo:
        return None, "Paciente no encontrado o inactivo."

    fecha_cita: date = data["fecha_cita"]
    hora_inicio: time = data["hora_inicio"]

    # Calcular hora fin según duración de consulta del médico
    inicio_dt = datetime.combine(fecha_cita, hora_inicio)
    fin_dt = inicio_dt + timedelta(minutes=medico.duracion_consulta_min)
    hora_fin = fin_dt.time()

    # Validar que la fecha no sea en el pasado
    if fecha_cita < date.today():
        return None, "No se puede agendar una cita en una fecha pasada."

    # Validar disponibilidad configurada del médico
    if not _verificar_disponibilidad_medico(medico, fecha_cita, hora_inicio, hora_fin):
        return None, (
            f"El médico no tiene disponibilidad configurada para ese día y horario. "
            f"Duración de consulta: {medico.duracion_consulta_min} minutos."
        )

    # Verificar conflicto con otros agendamientos del médico
    if _verificar_conflicto_medico(medico.id, fecha_cita, hora_inicio, hora_fin):
        return None, "El médico ya tiene una cita agendada en ese horario."

    # Verificar conflicto del paciente
    if _verificar_conflicto_paciente(paciente.id, fecha_cita, hora_inicio, hora_fin):
        return None, "El paciente ya tiene una cita en ese horario."

    # Generar código único
    codigo = generar_codigo_cita()
    while Agendamiento.query.filter_by(codigo_cita=codigo).first():
        codigo = generar_codigo_cita()

    agendamiento = Agendamiento(
        codigo_cita=codigo,
        paciente_id=data["paciente_id"],
        medico_id=data["medico_id"],
        fecha_cita=fecha_cita,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        tipo_consulta=data.get("tipo_consulta", "PRIMERA_VEZ"),
        modalidad=data.get("modalidad", "VIDEOCONSULTA"),
        motivo_consulta=data.get("motivo_consulta"),
        notas_adicionales=data.get("notas_adicionales"),
        nivel_triaje=data.get("nivel_triaje"),
        puntaje_triaje=data.get("puntaje_triaje"),
        estado="PENDIENTE",
    )

    db.session.add(agendamiento)
    db.session.flush()  # Obtener ID sin commit

    # Registrar historial
    historial = HistorialAgendamiento(
        agendamiento_id=agendamiento.id,
        estado_anterior=None,
        estado_nuevo="PENDIENTE",
        observacion="Agendamiento creado.",
        modificado_por=data.get("creado_por", "sistema"),
    )
    db.session.add(historial)
    db.session.commit()

    return agendamiento, None


def cambiar_estado(agendamiento_id: int, data: dict) -> tuple:
    """
    Cambia el estado de un agendamiento con validación de transiciones.
    Retorna (agendamiento, error_message).
    """
    agendamiento = Agendamiento.query.get(agendamiento_id)
    if not agendamiento:
        return None, "Agendamiento no encontrado."

    nuevo_estado = data["estado"]
    estado_actual = agendamiento.estado

    transiciones = TRANSICIONES_VALIDAS.get(estado_actual, [])
    if nuevo_estado not in transiciones:
        return None, (
            f"Transición inválida: '{estado_actual}' → '{nuevo_estado}'. "
            f"Transiciones permitidas: {transiciones}"
        )

    if nuevo_estado == "CANCELADA" and not data.get("motivo_cancelacion"):
        return None, "Se requiere motivo de cancelación."

    estado_anterior = agendamiento.estado
    agendamiento.estado = nuevo_estado

    if nuevo_estado == "CANCELADA":
        agendamiento.motivo_cancelacion = data.get("motivo_cancelacion")

    historial = HistorialAgendamiento(
        agendamiento_id=agendamiento.id,
        estado_anterior=estado_anterior,
        estado_nuevo=nuevo_estado,
        observacion=data.get("observacion"),
        modificado_por=data.get("modificado_por", "sistema"),
    )
    db.session.add(historial)
    db.session.commit()

    return agendamiento, None


def obtener_slots_disponibles(medico_id: int, fecha: date) -> list:
    """
    Calcula los slots de tiempo disponibles para un médico en una fecha dada.
    Retorna lista de slots {"hora_inicio": "HH:MM", "hora_fin": "HH:MM", "disponible": bool}
    """
    medico = Medico.query.get(medico_id)
    if not medico or not medico.activo:
        return []

    dia_nombre = DIA_SEMANA_MAP.get(fecha.weekday())
    disponibilidades = DisponibilidadMedico.query.filter_by(
        medico_id=medico_id,
        dia_semana=dia_nombre,
        activa=True,
    ).all()

    if not disponibilidades:
        return []

    # Citas ya agendadas ese día
    citas_existentes = Agendamiento.query.filter(
        Agendamiento.medico_id == medico_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
    ).all()

    slots = []
    duracion = timedelta(minutes=medico.duracion_consulta_min)

    for disp in disponibilidades:
        slot_inicio = datetime.combine(fecha, disp.hora_inicio)
        bloque_fin = datetime.combine(fecha, disp.hora_fin)

        while slot_inicio + duracion <= bloque_fin:
            slot_fin = slot_inicio + duracion
            hora_i = slot_inicio.time()
            hora_f = slot_fin.time()

            ocupado = any(
                not (cita.hora_fin <= hora_i or cita.hora_inicio >= hora_f)
                for cita in citas_existentes
            )

            slots.append({
                "hora_inicio": hora_i.strftime("%H:%M"),
                "hora_fin": hora_f.strftime("%H:%M"),
                "disponible": not ocupado,
            })
            slot_inicio = slot_fin

    return slots


def listar_agendamientos(filtros: dict):
    """
    Retorna query de agendamientos filtrada.
    filtros: paciente_id, medico_id, estado, fecha_inicio, fecha_fin, nivel_triaje
    """
    query = Agendamiento.query

    if filtros.get("paciente_id"):
        query = query.filter(Agendamiento.paciente_id == filtros["paciente_id"])
    if filtros.get("medico_id"):
        query = query.filter(Agendamiento.medico_id == filtros["medico_id"])
    if filtros.get("estado"):
        query = query.filter(Agendamiento.estado == filtros["estado"])
    if filtros.get("fecha_inicio"):
        query = query.filter(Agendamiento.fecha_cita >= filtros["fecha_inicio"])
    if filtros.get("fecha_fin"):
        query = query.filter(Agendamiento.fecha_cita <= filtros["fecha_fin"])
    if filtros.get("nivel_triaje"):
        query = query.filter(Agendamiento.nivel_triaje == filtros["nivel_triaje"])
    if filtros.get("modalidad"):
        query = query.filter(Agendamiento.modalidad == filtros["modalidad"])

    return query.order_by(Agendamiento.fecha_cita.asc(), Agendamiento.hora_inicio.asc())
