import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from app import db


class Usuario(db.Model):
    __tablename__ = "usuarios"

    id_usuario  = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre      = db.Column(db.Text, nullable=False)
    correo      = db.Column(db.Text, nullable=False, unique=True)
    contrasena  = db.Column(db.Text, nullable=False)
    rol         = db.Column(db.Text, nullable=False)   # paciente | medico | admin
    created_at  = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    paciente    = db.relationship("Paciente", back_populates="usuario", uselist=False)
    medico      = db.relationship("Medico",   back_populates="usuario", uselist=False)

    def __repr__(self):
        return f"<Usuario {self.correo} – {self.rol}>"
