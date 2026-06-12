from flask import Blueprint, request, jsonify
from models import db, Paciente

pacientes_bp = Blueprint('pacientes', __name__)

@pacientes_bp.route('/pacientes', methods=['POST'])
def crear_paciente():
    data = request.get_json() or {}
    
    if not data.get('correo'):
        return jsonify({"error": "El correo es obligatorio"}), 400
        
    # Verificar si el correo ya existe
    existe = Paciente.query.filter_by(correo=data['correo']).first()
    if existe:
        return jsonify({"error": "El correo ya está registrado"}), 409

    nuevo_paciente = Paciente(
        nombre=data.get('nombre'),
        correo=data.get('correo'),
        telefono=data.get('telefono'),
        edad=int(data.get('edad', 0)) if data.get('edad') else None,
        contraseña=data.get('contraseña') or 'temporal123'
    )

    db.session.add(nuevo_paciente)
    db.session.commit()

    return jsonify({
        "mensaje": "Paciente creado correctamente",
        "paciente": nuevo_paciente.to_dict()
    }), 201

@pacientes_bp.route('/pacientes', methods=['GET'])
def obtener_pacientes():

    pacientes = Paciente.query.all()
    return jsonify([paciente.to_dict() for paciente in pacientes])

@pacientes_bp.route('/pacientes/<int:paciente_id>', methods=['GET'])
def obtener_paciente(paciente_id):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
    return jsonify(paciente.to_dict())

@pacientes_bp.route('/pacientes/<int:paciente_id>', methods=['PUT'])
def actualizar_paciente(paciente_id):
    paciente = Paciente.query.get(paciente_id)
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
    
    data = request.get_json() or {}
    if 'nombre' in data:
        paciente.nombre = data['nombre']
    if 'correo' in data:
        paciente.correo = data['correo']
    if 'telefono' in data:
        paciente.telefono = data['telefono']
    if 'edad' in data:
        try:
            paciente.edad = int(data['edad'])
        except (ValueError, TypeError):
            pass
    if 'contraseña' in data:
        paciente.contraseña = data['contraseña']
        
    db.session.commit()
    return jsonify({
        "mensaje": "Paciente actualizado correctamente",
        "paciente": paciente.to_dict()
    })

@pacientes_bp.route('/pacientes/buscar/<string:identificador>', methods=['GET'])
def buscar_paciente(identificador):
    # Buscar por correo o teléfono
    paciente = Paciente.query.filter(
        (Paciente.correo == identificador) | (Paciente.telefono == identificador)
    ).first()
    if not paciente:
        # Intentar buscar por nombre
        paciente = Paciente.query.filter(Paciente.nombre.ilike(f"%{identificador}%")).first()
    
    if not paciente:
        return jsonify({"error": "Paciente no encontrado"}), 404
        
    return jsonify(paciente.to_dict())