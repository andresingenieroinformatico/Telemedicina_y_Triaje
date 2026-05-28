from datetime import datetime, timezone
from app import db


class HistorialAgendamiento(db.Model):
    """
    Historial de cambios de estado de los agendamientos.
    Permite auditar quién cambió qué y cuándo.
    """
    __tablename__ = "historial_agendamientos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    agendamiento_id = db.Column(
        db.Integer,
        db.ForeignKey("agendamientos.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    estado_anterior = db.Column(db.String(30), nullable=True)
    estado_nuevo = db.Column(db.String(30), nullable=False)
    observacion = db.Column(db.Text, nullable=True)
    modificado_por = db.Column(db.String(100), nullable=True)
    fecha_cambio = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relación
    agendamiento = db.relationship("Agendamiento", back_populates="historial")

    def __repr__(self):
        return f"<Historial cita={self.agendamiento_id} {self.estado_anterior}->{self.estado_nuevo}>"
