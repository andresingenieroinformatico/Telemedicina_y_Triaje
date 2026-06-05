from microservices.videoconferencias.app import db
from .base import TimestampMixin


class Especialidad(db.Model, TimestampMixin):
    """Especialidades médicas disponibles en la plataforma."""
    __tablename__ = "especialidades"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre = db.Column(db.String(100), nullable=False, unique=True)
    descripcion = db.Column(db.Text, nullable=True)
    activa = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    medicos = db.relationship("Medico", back_populates="especialidad", lazy="dynamic")

    def __repr__(self):
        return f"<Especialidad {self.nombre}>"
