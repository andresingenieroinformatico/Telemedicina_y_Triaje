"""
app/models/signos_vitales.py
Registro de signos vitales del paciente (enviados por el traje automatizado).
"""
from datetime import datetime
from app import db


class SignosVitales(db.Model):
    __tablename__ = "signos_vitales"

    id                  = db.Column(db.Integer, primary_key=True)
    historial_id        = db.Column(db.Integer, db.ForeignKey("historiales_medicos.id",
                                                               ondelete="CASCADE"), nullable=False)

    # ── Mediciones del traje automatizado ──────────────────
    frecuencia_cardiaca = db.Column(db.Float)   # bpm
    presion_sistolica   = db.Column(db.Float)   # mmHg
    presion_diastolica  = db.Column(db.Float)   # mmHg
    temperatura         = db.Column(db.Float)   # °C
    saturacion_oxigeno  = db.Column(db.Float)   # % SpO2
    frecuencia_respiratoria = db.Column(db.Float) # respiraciones/min
    glucosa             = db.Column(db.Float)   # mg/dL  (opcional)
    peso                = db.Column(db.Float)   # kg
    altura              = db.Column(db.Float)   # m

    fuente              = db.Column(db.String(50), default="traje_automatizado")
    observaciones       = db.Column(db.Text)
    registrado_en       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    historial = db.relationship("HistorialMedico", back_populates="signos")

    @property
    def imc(self) -> float | None:
        """Índice de Masa Corporal calculado en tiempo real."""
        if self.peso and self.altura and self.altura > 0:
            return round(self.peso / (self.altura ** 2), 2)
        return None

    @property
    def presion_arterial(self) -> str | None:
        if self.presion_sistolica and self.presion_diastolica:
            return f"{self.presion_sistolica}/{self.presion_diastolica} mmHg"
        return None

    def __repr__(self):
        return f"<SignosVitales historial={self.historial_id} fecha={self.registrado_en:%Y-%m-%d %H:%M}>"
