from microservices.videoconferencias.app import db
from .base import TimestampMixin


class DisponibilidadMedico(db.Model, TimestampMixin):
    """
    Horarios de disponibilidad semanal de cada médico.
    Representa los bloques horarios en los que el médico atiende.
    """
    __tablename__ = "disponibilidad_medico"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    medico_id = db.Column(
        db.Integer,
        db.ForeignKey("medicos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    dia_semana = db.Column(
        db.Enum("LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO",
                name="dia_semana_enum"),
        nullable=False
    )
    hora_inicio = db.Column(db.Time, nullable=False)
    hora_fin = db.Column(db.Time, nullable=False)
    activa = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    medico = db.relationship("Medico", back_populates="disponibilidades")

    __table_args__ = (
        db.UniqueConstraint("medico_id", "dia_semana", "hora_inicio", name="uq_medico_dia_hora"),
        db.CheckConstraint("hora_fin > hora_inicio", name="chk_horario_valido"),
    )

    def __repr__(self):
        return f"<Disponibilidad médico={self.medico_id} {self.dia_semana} {self.hora_inicio}-{self.hora_fin}>"
