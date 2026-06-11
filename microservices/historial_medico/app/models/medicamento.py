"""
app/models/medicamento.py
Catálogo de medicamentos y tabla de prescripciones por consulta.
"""
from datetime import datetime
from app import db


class Medicamento(db.Model):
    """Catálogo general de medicamentos disponibles."""

    __tablename__ = "medicamentos"

    id              = db.Column(db.Integer, primary_key=True)
    nombre          = db.Column(db.String(150), nullable=False, unique=True)
    principio_activo= db.Column(db.String(150))
    forma_farmaceutica = db.Column(db.String(80))   # tableta, jarabe, inyectable…
    concentracion   = db.Column(db.String(50))      # 500 mg, 250 mg/5 ml…
    descripcion     = db.Column(db.Text)
    requiere_receta = db.Column(db.Boolean, default=True)
    activo          = db.Column(db.Boolean, default=True)
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    prescripciones  = db.relationship("PrescripcionMedicamento", back_populates="medicamento")

    def __repr__(self):
        return f"<Medicamento {self.nombre}>"


class PrescripcionMedicamento(db.Model):
    """Medicamento recetado en una consulta específica."""

    __tablename__ = "prescripciones_medicamentos"

    id              = db.Column(db.Integer, primary_key=True)
    consulta_id     = db.Column(db.Integer, db.ForeignKey("consultas.id", ondelete="CASCADE"),
                                nullable=False)
    medicamento_id  = db.Column(db.Integer, db.ForeignKey("medicamentos.id"), nullable=False)

    dosis           = db.Column(db.String(100), nullable=False)   # "500 mg"
    frecuencia      = db.Column(db.String(100), nullable=False)   # "cada 8 horas"
    duracion        = db.Column(db.String(100))                   # "7 días"
    instrucciones   = db.Column(db.Text)                          # "tomar con alimentos"
    creado_en       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    consulta        = db.relationship("Consulta",     back_populates="prescripciones")
    medicamento     = db.relationship("Medicamento",  back_populates="prescripciones")

    def __repr__(self):
        return f"<Prescripcion consulta={self.consulta_id} med={self.medicamento_id}>"
