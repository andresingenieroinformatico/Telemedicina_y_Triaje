from app import db
from .base import TimestampMixin


class Medico(db.Model, TimestampMixin):
    """Médicos habilitados en la plataforma de telemedicina."""
    __tablename__ = "medicos"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero_registro = db.Column(db.String(30), nullable=False, unique=True, index=True)
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    telefono = db.Column(db.String(20), nullable=False)
    especialidad_id = db.Column(
        db.Integer,
        db.ForeignKey("especialidades.id", ondelete="RESTRICT"),
        nullable=False,
        index=True
    )
    duracion_consulta_min = db.Column(db.Integer, nullable=False, default=30)
    tarifa_consulta = db.Column(db.Numeric(10, 2), nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    especialidad = db.relationship("Especialidad", back_populates="medicos")
    disponibilidades = db.relationship(
        "DisponibilidadMedico", back_populates="medico", lazy="dynamic", cascade="all, delete-orphan"
    )
    agendamientos = db.relationship("Agendamiento", back_populates="medico", lazy="dynamic")

    @property
    def nombre_completo(self):
        return f"Dr(a). {self.nombres} {self.apellidos}"

    def __repr__(self):
        return f"<Medico {self.numero_registro} - {self.nombre_completo}>"
