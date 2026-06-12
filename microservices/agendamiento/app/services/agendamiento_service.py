"""
Servicio de Agendamientos - Lógica de negocio central.
Plataforma de Telemedicina y Triaje Automatizado.
"""
import random
import string
from datetime import date, time, datetime, timedelta
from typing import Optional, Union

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
    query = db.session.query(Agendamiento).filter(
        Agendamiento.medico_id == medico_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
        Agendamiento.hora_inicio < hora_fin,
        Agendamiento.hora_fin > hora_inicio
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
    query = db.session.query(Agendamiento).filter(
        Agendamiento.paciente_id == paciente_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
        Agendamiento.hora_inicio < hora_fin,
        Agendamiento.hora_fin > hora_inicio
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
    disponibilidad = db.session.query(DisponibilidadMedico).filter(
        DisponibilidadMedico.medico_id == medico.id,
        DisponibilidadMedico.dia_semana == dia_nombre,
        DisponibilidadMedico.hora_inicio <= hora_inicio,
        DisponibilidadMedico.hora_fin >= hora_fin,
        DisponibilidadMedico.activa == True,  # noqa: E712
    ).first()
    return disponibilidad is not None


def crear_agendamiento(data: dict) -> tuple[Optional[Agendamiento], Optional[str]]:
    """
    Crea un nuevo agendamiento con todas las validaciones de negocio.
    Retorna (agendamiento, error_message).
    """
    medico_id = data.get("medico_id")
    paciente_id = data.get("paciente_id")
    
    if not medico_id or not paciente_id:
        return None, "ID de médico y paciente son requeridos."

    # Conversión robusta de IDs para evitar errores de tipo
    try:
        medico_id = int(medico_id)
        paciente_id = int(paciente_id)
    except (ValueError, TypeError):
        return None, "Los IDs de médico y paciente deben ser numéricos."

    # Verificación de conexión a base de datos y existencia de registros
    try:
        medico = db.session.get(Medico, medico_id)
        paciente = db.session.get(Paciente, paciente_id)
    except Exception as e:
        return None, f"Error de conexión con la base de datos: {str(e)}"

    if not medico or not medico.activo:
        return None, "Médico no encontrado o inactivo."

    if not paciente or not paciente.activo:
        return None, "Paciente no encontrado o inactivo."

<<<<<<< Updated upstream
    fecha_cita: date = data["fecha_cita"]
    hora_inicio: time = data["hora_inicio"]
=======
    # Conversión de tipos para compatibilidad con JSON/Frontend (strings ISO a objetos date/time)
    fecha_cita = data.get("fecha_cita")
    if isinstance(fecha_cita, str):
        fecha_cita = date.fromisoformat(fecha_cita)
    
    if not fecha_cita:
        return None, "La fecha de la cita es requerida."

    # Soporte para 'hora_inicio' (backend) o 'hora_cita' (frontend)
    hora_inicio = data.get("hora_inicio") or data.get("hora_cita")
    if not hora_inicio:
        return None, "La hora de la cita es requerida."
>>>>>>> Stashed changes

    if isinstance(hora_inicio, str):
        try:
            # Normaliza formato HH:MM (soporta HH:MM:SS truncando si es necesario)
            hora_inicio = time.fromisoformat(hora_inicio[:5])
        except ValueError:
            return None, "Formato de hora inválido. Use HH:MM."

    # Calcular hora fin según duración de consulta del médico
    inicio_dt = datetime.combine(fecha_cita, hora_inicio)
    duracion = medico.duracion_consulta_min if medico.duracion_consulta_min else 30
    fin_dt = inicio_dt + timedelta(minutes=duracion)
    hora_fin = fin_dt.time()

    # Validar que la fecha no sea en el pasado
    if fecha_cita < date.today():
        return None, "No se puede agendar una cita en una fecha pasada."
        
    # Validar que si es hoy, la hora no haya pasado
    if fecha_cita == date.today() and hora_inicio < datetime.now().time():
        return None, "No se puede agendar una cita en un horario que ya pasó hoy."

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
    codigo = generar_codigo_cita() # Genera un código único
    while db.session.query(Agendamiento).filter_by(codigo_cita=codigo).first(): # Verifica que no exista
        codigo = generar_codigo_cita()

    agendamiento = Agendamiento(
        codigo_cita=codigo,
        paciente_id=paciente_id,
        medico_id=medico_id,
        fecha_cita=fecha_cita,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        tipo_consulta=data.get("tipo_consulta", "PRIMERA_VEZ"),
        modalidad=data.get("modalidad", "VIDEOCONSULTA"),
        motivo_consulta=data.get("motivo_consulta"),
        notas_adicionales=data.get("notas_adicionales"),
        nivel_triaje=data.get("nivel_triaje") or data.get("nivel_asignado"),
        puntaje_triaje=data.get("puntaje_triaje") or data.get("puntaje"),
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


def cambiar_estado(agendamiento_id: int, data: dict) -> tuple[Optional[Agendamiento], Optional[str]]:
    """
    Cambia el estado de un agendamiento con validación de transiciones.
    Retorna (agendamiento, error_message).
    """
    agendamiento = db.session.get(Agendamiento, agendamiento_id)
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
    try:
        med_id = int(medico_id)
    except (ValueError, TypeError):
        return []

    # Asegurar que la fecha sea un objeto date válido
    if not fecha:
        return []
    if isinstance(fecha, str):
        fecha = date.fromisoformat(fecha)

    medico = db.session.get(Medico, med_id)
    if not medico or not medico.activo:
        return []

    dia_nombre = DIA_SEMANA_MAP.get(fecha.weekday())
    disponibilidades = db.session.query(DisponibilidadMedico).filter_by(
        medico_id=med_id,
        dia_semana=dia_nombre,
        activa=True,
    ).all()

    if not disponibilidades:
        return []

    # Optimización: Solo traer las horas para reducir carga en memoria
    citas_existentes = db.session.query(Agendamiento.hora_inicio, Agendamiento.hora_fin).filter(
        Agendamiento.medico_id == med_id,
        Agendamiento.fecha_cita == fecha,
        Agendamiento.estado.notin_(["CANCELADA", "NO_ASISTIO"]),
    ).all()

    slots = []
    duracion_min = medico.duracion_consulta_min if medico.duracion_consulta_min else 30
    duracion = timedelta(minutes=duracion_min)

    for disp in disponibilidades:
        slot_inicio = datetime.combine(fecha, disp.hora_inicio)
        bloque_fin = datetime.combine(fecha, disp.hora_fin)

        # Pre-calculamos los slots para mejorar el rendimiento
        while slot_inicio + duracion <= bloque_fin:
            slot_fin = slot_inicio + duracion
            hora_i = slot_inicio.time()
            hora_f = slot_fin.time()

            # Lógica de solapamiento corregida para acceso por índice (0: inicio, 1: fin)
            es_conflicto = any( # Verifica si el slot se solapa con alguna cita existente
                not (cita[1] <= hora_i or cita[0] >= hora_f) # cita[0] es hora_inicio, cita[1] es hora_fin
                for cita in citas_existentes
            )

            slots.append({
                "hora_inicio": hora_i.strftime("%H:%M"),
                "hora_fin": hora_f.strftime("%H:%M"),
                "disponible": not es_conflicto,
            })
            slot_inicio = slot_fin

    return slots


def listar_agendamientos(filtros: dict):
    """
    Retorna query de agendamientos filtrada.
    filtros: paciente_id, medico_id, estado, fecha_inicio, fecha_fin, nivel_triaje
    """
    query = db.session.query(Agendamiento)

    # Extraemos filtros a variables locales para ayudar al tipado de Pylance
    p_id = filtros.get("paciente_id")
    m_id = filtros.get("medico_id")
    est = filtros.get("estado")
    f_ini = filtros.get("fecha_inicio")
    f_fin = filtros.get("fecha_fin")
    n_tri = filtros.get("nivel_triaje")
    mod = filtros.get("modalidad")

    if p_id:
        query = query.filter_by(paciente_id=p_id)
    if m_id:
        query = query.filter_by(medico_id=m_id)
    if est:
        query = query.filter_by(estado=est)
    if f_ini:
        query = query.filter(Agendamiento.fecha_cita >= f_ini)
    if f_fin:
        query = query.filter(Agendamiento.fecha_cita <= f_fin)
    if n_tri:
        query = query.filter_by(nivel_triaje=n_tri)
    if mod:
        query = query.filter_by(modalidad=mod)

    return query.order_by(Agendamiento.fecha_cita.asc(), Agendamiento.hora_inicio.asc())
