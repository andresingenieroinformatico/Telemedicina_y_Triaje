"""
app/models/historial.py
Modelo de Historial Médico – ficha clínica principal del paciente.
"""
from datetime import datetime
from microservices.videoconferencias.app import db


class HistorialMedico(db.Model):
    __tablename__ = "historiales_medicos"

    id                  = db.Column(db.Integer, primary_key=True)
    paciente_id         = db.Column(db.Integer, db.ForeignKey("pacientes.id", ondelete="CASCADE"),
                                    unique=True, nullable=False)

    # ── Antecedentes personales ─────────────────────────────
    alergias            = db.Column(db.Text)          # texto libre o JSON serializado
    enfermedades_cronicas= db.Column(db.Text)
    cirugias_previas    = db.Column(db.Text)
    medicamentos_actuales= db.Column(db.Text)
    habitos             = db.Column(db.Text)          # tabaco, alcohol, ejercicio, etc.

    # ── Antecedentes familiares ─────────────────────────────
    antecedentes_familiares = db.Column(db.Text)

    # ── Observaciones generales del médico ──────────────────
    observaciones       = db.Column(db.Text)

    creado_en           = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en      = db.Column(db.DateTime, default=datetime.utcnow,
                                    onupdate=datetime.utcnow, nullable=False)

    # ── Relaciones ──────────────────────────────────────────
    paciente   = db.relationship("Paciente", back_populates="historial")
    consultas  = db.relationship("Consulta",     back_populates="historial",
                                 cascade="all, delete-orphan", lazy="dynamic")
    signos     = db.relationship("SignosVitales", back_populates="historial",
                                 cascade="all, delete-orphan", lazy="dynamic",
                                 order_by="SignosVitales.registrado_en.desc()")

    def __repr__(self):
        return f"<HistorialMedico paciente_id={self.paciente_id}>"
