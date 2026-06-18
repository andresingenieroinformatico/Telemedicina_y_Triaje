import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app import db


class Medico(db.Model):
    __tablename__ = "medicos"

    id_medico        = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario       = db.Column(UUID(as_uuid=True), db.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    especialidad     = db.Column(db.Text, nullable=False)
    numero_colegiado = db.Column(db.Text, nullable=False, unique=True)
    created_at       = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    usuario          = db.relationship("Usuario",         back_populates="medico")
    historiales      = db.relationship("HistorialMedico", back_populates="medico",  lazy="dynamic")
    citas            = db.relationship("Cita",             back_populates="medico",  lazy="dynamic")

    def __repr__(self):
        return f"<Medico {self.especialidad} – {self.numero_colegiado}>"
