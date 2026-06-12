from app import db
from .base import TimestampMixin


class Paciente(db.Model, TimestampMixin):
    """Pacientes registrados en la plataforma de telemedicina."""
    __tablename__ = "pacientes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    numero_documento = db.Column(db.String(20), nullable=False, unique=True, index=True)
    tipo_documento = db.Column(
        db.Enum("CC", "TI", "CE", "PA", name="tipo_documento_enum"),
        nullable=False,
        default="CC"
    )
    nombres = db.Column(db.String(100), nullable=False)
    apellidos = db.Column(db.String(100), nullable=False)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    genero = db.Column(
        db.Enum("M", "F", "O", name="genero_enum"),
        nullable=False
    )
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    telefono = db.Column(db.String(20), nullable=False)
    direccion = db.Column(db.String(255), nullable=True)
    ciudad = db.Column(db.String(100), nullable=True)
    activo = db.Column(db.Boolean, default=True, nullable=False)

    # Relaciones
    agendamientos = db.relationship("Agendamiento", back_populates="paciente", lazy="dynamic")

    @property
    def nombre_completo(self):
        return f"{self.nombres} {self.apellidos}"

    def __repr__(self):
        return f"<Paciente {self.numero_documento} - {self.nombre_completo}>"
