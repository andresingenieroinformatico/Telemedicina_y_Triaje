import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app import db


class Cita(db.Model):
    __tablename__ = "citas"

    id_cita     = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_paciente = db.Column(UUID(as_uuid=True), db.ForeignKey("pacientes.id_paciente", ondelete="CASCADE"), nullable=False)
    id_medico   = db.Column(UUID(as_uuid=True), db.ForeignKey("medicos.id_medico"),    nullable=False)
    fecha_cita  = db.Column(db.DateTime(timezone=True), nullable=False)
    motivo      = db.Column(db.Text)
    estado      = db.Column(db.Text, default="pendiente")  # pendiente | confirmada | cancelada | completada
    created_at  = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    paciente    = db.relationship("Paciente", back_populates="citas")
    medico      = db.relationship("Medico",   back_populates="citas")

    def __repr__(self):
        return f"<Cita {self.id_cita} – {self.estado}>"
