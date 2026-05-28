from flask import Blueprint, request, jsonify
from servicio_usuarios.models import db, Paciente

pacientes_bp = Blueprint('pacientes', __name__)

@pacientes_bp.route('/pacientes', methods=['POST'])
def crear_paciente():

    data = request.get_json()

    nuevo_paciente = Paciente(
        nombre=data['nombre'],
        correo=data['correo'],
        telefono=data['telefono'],
        edad=data['edad'],
        contraseña=data['contraseña']
    )

    db.session.add(nuevo_paciente)

    db.session.commit()

    return jsonify({
        "mensaje": "Paciente creado correctamente"
    })

@pacientes_bp.route('/pacientes', methods=['GET'])
def obtener_pacientes():

    pacientes = Paciente.query.all()

    resultado = []

    for paciente in pacientes:

        resultado.append({
            "id": paciente.id,
            "nombre": paciente.nombre,
            "correo": paciente.correo,
            "telefono": paciente.telefono,
            "edad": paciente.edad
        })

    return jsonify(resultado)