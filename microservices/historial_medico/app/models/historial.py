import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app import db


class HistorialMedico(db.Model):
    __tablename__ = "historial_medico"

    id_historial  = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_paciente   = db.Column(UUID(as_uuid=True), db.ForeignKey("pacientes.id_paciente", ondelete="CASCADE"), nullable=False)
    id_medico     = db.Column(UUID(as_uuid=True), db.ForeignKey("medicos.id_medico"),     nullable=False)
    fecha         = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    diagnostico   = db.Column(db.Text)
    tratamiento   = db.Column(db.Text)
    observaciones = db.Column(db.Text)
    created_at    = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    paciente      = db.relationship("Paciente", back_populates="historiales")
    medico        = db.relationship("Medico",   back_populates="historiales")
    recetas       = db.relationship("Receta",   back_populates="historial",
                                    cascade="all, delete-orphan", lazy="dynamic")

    def __repr__(self):
        return f"<HistorialMedico {self.id_historial} paciente={self.id_paciente}>"
