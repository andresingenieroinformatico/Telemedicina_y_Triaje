import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app import db


class Receta(db.Model):
    __tablename__ = "recetas"

    id_receta    = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_historial = db.Column(UUID(as_uuid=True), db.ForeignKey("historial_medico.id_historial", ondelete="CASCADE"), nullable=False)
    medicamento  = db.Column(db.Text, nullable=False)
    dosis        = db.Column(db.Text, nullable=False)
    indicaciones = db.Column(db.Text)
    duracion     = db.Column(db.Text)
    created_at   = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    historial    = db.relationship("HistorialMedico", back_populates="recetas")

    def __repr__(self):
        return f"<Receta {self.medicamento} – {self.dosis}>"
