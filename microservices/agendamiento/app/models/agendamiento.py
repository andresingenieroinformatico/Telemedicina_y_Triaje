from microservices.videoconferencias.app import db
from .base import TimestampMixin


class Agendamiento(db.Model, TimestampMixin):
    """
    Agendamiento / Cita médica en la plataforma de telemedicina.
    Este es el modelo central del módulo de agendamientos.
    """
    __tablename__ = "agendamientos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_cita = db.Column(db.String(20), nullable=False, unique=True, index=True)

    # Participantes
    paciente_id = db.Column(
        db.Integer,
        db.ForeignKey("pacientes.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    medico_id = db.Column(
        db.Integer,
        db.ForeignKey("medicos.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )

    # Fecha y hora
    fecha_cita = db.Column(db.Date, nullable=False, index=True)
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)

    # Tipo y modalidad
    tipo_consulta = db.Column(
        db.Enum("PRIMERA_VEZ", "CONTROL", "URGENCIA", "SEGUIMIENTO", name="tipo_consulta_enum"),
        nullable=False,
        default="PRIMERA_VEZ"
    )
    modalidad = db.Column(
        db.Enum("VIDEOCONSULTA", "CHAT", "TELEFONO", name="modalidad_enum"),
        nullable=False,
        default="VIDEOCONSULTA"
    )

    # Estado del agendamiento
    estado = db.Column(
        db.Enum(
            "PENDIENTE",
            "CONFIRMADA",
            "EN_CURSO",
            "COMPLETADA",
            "CANCELADA",
            "NO_ASISTIO",
            name="estado_agendamiento_enum"
        ),
        nullable=False,
        default="PENDIENTE",
        index=True
    )

    # Motivo / notas
    motivo_consulta = db.Column(db.Text, nullable=True)
    notas_adicionales = db.Column(db.Text, nullable=True)
    motivo_cancelacion = db.Column(db.String(255), nullable=True)

    # Triaje / Prioridad (integración con módulo de triaje)
    nivel_triaje = db.Column(
        db.Enum("VERDE", "AMARILLO", "NARANJA", "ROJO", name="nivel_triaje_enum"),
        nullable=True
    )
    puntaje_triaje = db.Column(db.Integer, nullable=True)

    # Videoconferencia
    enlace_videoconsulta = db.Column(db.String(500), nullable=True)
    sala_id = db.Column(db.String(100), nullable=True)

    # Recordatorios
    recordatorio_enviado = db.Column(db.Boolean, default=False)
    confirmado_por_paciente = db.Column(db.Boolean, default=False)

    # Relaciones
    paciente = db.relationship("Paciente", back_populates="agendamientos")
    medico = db.relationship("Medico", back_populates="agendamientos")
    historial = db.relationship(
        "HistorialAgendamiento", back_populates="agendamiento",
        lazy="dynamic", cascade="all, delete-orphan"
    )

    __table_args__ = (
        db.CheckConstraint("hora_fin > hora_inicio", name="chk_cita_horario_valido"),
        db.Index("ix_agendamiento_fecha_medico", "fecha_cita", "medico_id"),
        db.Index("ix_agendamiento_fecha_paciente", "fecha_cita", "paciente_id"),
    )

    def __repr__(self):
        return f"<Agendamiento {self.codigo_cita} - {self.estado}>"
