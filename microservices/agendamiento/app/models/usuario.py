from werkzeug.security import generate_password_hash, check_password_hash
from microservices.videoconferencias.app import db
from .base import TimestampMixin


class Usuario(db.Model, TimestampMixin):
    """Usuarios de la plataforma con autenticación."""
    __tablename__ = "usuarios"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(100), nullable=False, unique=True, index=True)
    email = db.Column(db.String(150), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    
    # Relación con médico (si aplica)
    medico_id = db.Column(db.Integer, db.ForeignKey("medicos.id"), nullable=True)
    medico = db.relationship("Medico", lazy="joined")
    
    # Relación con paciente (si aplica)
    paciente_id = db.Column(db.Integer, db.ForeignKey("pacientes.id"), nullable=True)
    paciente = db.relationship("Paciente", lazy="joined")
    
    rol = db.Column(
        db.Enum("ADMIN", "MEDICO", "PACIENTE", name="rol_enum"),
        nullable=False,
        default="PACIENTE"
    )
    activo = db.Column(db.Boolean, default=True, nullable=False)

    def set_password(self, password: str):
        """Hashea y establece la contraseña."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verifica si la contraseña coincide."""
        return check_password_hash(self.password_hash, password)

    def __repr__(self):
        return f"<Usuario {self.username} ({self.rol})>"
