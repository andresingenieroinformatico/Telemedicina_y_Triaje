import uuid
from datetime import datetime, date
from sqlalchemy.dialects.postgresql import UUID
from app import db


class Paciente(db.Model):
    __tablename__ = "pacientes"

    id_paciente      = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    id_usuario       = db.Column(UUID(as_uuid=True), db.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"), nullable=False)
    documento        = db.Column(db.Text, nullable=False, unique=True)
    fecha_nacimiento = db.Column(db.Date, nullable=False)
    genero           = db.Column(db.Text)   # M | F | otro
    telefono         = db.Column(db.Text)
    direccion        = db.Column(db.Text)
    created_at       = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

    # Relaciones
    usuario          = db.relationship("Usuario",        back_populates="paciente")
    historiales      = db.relationship("HistorialMedico", back_populates="paciente",
                                       cascade="all, delete-orphan", lazy="dynamic")
    citas            = db.relationship("Cita",            back_populates="paciente",
                                       cascade="all, delete-orphan", lazy="dynamic")

    @property
    def edad(self):
        today = date.today()
        fn = self.fecha_nacimiento
        return today.year - fn.year - ((today.month, today.day) < (fn.month, fn.day))

    def __repr__(self):
        return f"<Paciente {self.documento}>"
