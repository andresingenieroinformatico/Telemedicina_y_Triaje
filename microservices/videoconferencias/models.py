from config import db
from datetime import datetime

class Sala(db.Model):
    __tablename__ = "salas"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    url_sala = db.Column(db.String(255), nullable=False)
    estado = db.Column(db.String(50), default="activa")
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

    sesiones = db.relationship("Sesion", backref="sala", lazy=True)


class Sesion(db.Model):
    __tablename__ = "sesiones"

    id = db.Column(db.Integer, primary_key=True)
    sala_id = db.Column(db.Integer, db.ForeignKey("salas.id"), nullable=False)
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime, nullable=True)

    participantes = db.relationship("Participante", backref="sesion", lazy=True)


class Participante(db.Model):
    __tablename__ = "participantes"

    id = db.Column(db.Integer, primary_key=True)
    sesion_id = db.Column(db.Integer, db.ForeignKey("sesiones.id"), nullable=False)
    usuario_id = db.Column(db.Integer, nullable=False)
    rol = db.Column(db.String(50), nullable=False)