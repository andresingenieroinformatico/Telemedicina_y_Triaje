"""
app/models/consulta.py
Modelo de Consulta Médica – cada visita/sesión de telemedicina.
"""
from datetime import datetime
from microservices.videoconferencias.app import db


class Consulta(db.Model):
    __tablename__ = "consultas"

    id              = db.Column(db.Integer, primary_key=True)
    historial_id    = db.Column(db.Integer, db.ForeignKey("historiales_medicos.id",
                                                           ondelete="CASCADE"), nullable=False)

    medico_id       = db.Column(db.Integer, nullable=False)   # FK al módulo de médicos (otro equipo)
    fecha_consulta  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    motivo          = db.Column(db.String(255), nullable=False)
    tipo            = db.Column(db.String(50), default="telemedicina")  # presencial | telemedicina
    sintomas        = db.Column(db.Text)
    diagnostico     = db.Column(db.Text)
    tratamiento     = db.Column(db.Text)
    notas_medico    = db.Column(db.Text)
    proxima_cita    = db.Column(db.DateTime)
    estado          = db.Column(db.String(30), default="completada")  # pendiente | completada | cancelada

    creado_en       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    actualizado_en  = db.Column(db.DateTime, default=datetime.utcnow,
                                onupdate=datetime.utcnow, nullable=False)

    # ── Relaciones ─────────────────────────────────────────
    historial       = db.relationship("HistorialMedico", back_populates="consultas")
    prescripciones  = db.relationship("PrescripcionMedicamento", back_populates="consulta",
                                      cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Consulta id={self.id} fecha={self.fecha_consulta:%Y-%m-%d}>"
