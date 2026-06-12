from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Paciente(db.Model):

    __tablename__ = 'pacientes'

    id = db.Column(db.Integer, primary_key=True)

    nombre = db.Column(db.String(100), nullable=False)

    correo = db.Column(db.String(100), unique=True)

    telefono = db.Column(db.String(20))

    edad = db.Column(db.Integer)

    contraseña = db.Column(db.String(200))

    def to_dict(self):

        return {
            "id": self.id,
            "nombre": self.nombre,
            "correo": self.correo,
            "telefono": self.telefono,
            "edad": self.edad
        }