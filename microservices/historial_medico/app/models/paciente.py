"""
app/models/paciente.py
Modelo de Paciente – datos demográficos y de contacto.
"""
from datetime import datetime, date
from app import db


class Paciente(db.Model):
    __tablename__ = "pacientes"

    id              = db.Column(db.Integer, primary_key=True)
    cedula          = db.Column(db.String(20),  unique=True, nullable=False, index=True)
    nombres         = db.Column(db.String(100), nullable=False)
    apellidos       = db.Column(db.String(100), nullable=False)
    fecha_nacimiento= db.Column(db.Date,        nullable=False)
    genero          = db.Column(db.String(20),  nullable=False)   # M / F / Otro
    tipo_sangre     = db.Column(db.String(5))                      # A+, O-, etc.
    correo          = db.Column(db.String(150), unique=True)
    telefono        = db.Column(db.String(20))
    direccion       = db.Column(db.String(255))
    activo          = db.Column(db.Boolean, default=True, nullable=False)
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en  = db.Column(db.DateTime, default=datetime.utcnow,
                                onupdate=datetime.utcnow, nullable=False)

    # ── Relaciones ─────────────────────────────────────────
    historial = db.relationship(
        "HistorialMedico", back_populates="paciente",
        uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Paciente {self.cedula} – {self.nombres} {self.apellidos}>"

    @property
    def edad(self) -> int:
        today = date.today()
        return (
            today.year - self.fecha_nacimiento.year
            - ((today.month, today.day) < (self.fecha_nacimiento.month, self.fecha_nacimiento.day))
        )
