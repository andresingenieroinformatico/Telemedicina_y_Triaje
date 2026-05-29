"""
Script para crear usuarios de prueba con autenticación.
Ejecutar: python create_users.py
"""
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from microservices.videoconferencias.app import create_app, db
from app.models import Usuario, Medico, Paciente

app = create_app("development")

def create_test_users():
    with app.app_context():
        print("🔐 Creando usuarios de prueba...")
        
        # Verificar si ya existen
        if Usuario.query.filter_by(username="admin").first():
            print("⚠️  Usuario admin ya existe.")
        else:
            admin = Usuario(username="admin", email="admin@telemedicina.co", rol="ADMIN", activo=True)
            admin.set_password("admin123456")
            db.session.add(admin)
            print("✅ Usuario ADMIN creado: admin / admin123456")

        # Médico usuario
        medico = Medico.query.first()
        if medico and not Usuario.query.filter_by(medico_id=medico.id).first():
            medico_user = Usuario(
                username=f"medico_{medico.id}",
                email=medico.email,
                rol="MEDICO",
                medico_id=medico.id,
                activo=True
            )
            medico_user.set_password("medico123456")
            db.session.add(medico_user)
            print(f"✅ Usuario MEDICO creado: medico_{medico.id} / medico123456")

        # Paciente usuario
        paciente = Paciente.query.first()
        if paciente and not Usuario.query.filter_by(paciente_id=paciente.id).first():
            paciente_user = Usuario(
                username=f"paciente_{paciente.id}",
                email=paciente.email,
                rol="PACIENTE",
                paciente_id=paciente.id,
                activo=True
            )
            paciente_user.set_password("paciente123456")
            db.session.add(paciente_user)
            print(f"✅ Usuario PACIENTE creado: paciente_{paciente.id} / paciente123456")

        db.session.commit()
        print("\n✅ Usuarios de prueba creados exitosamente!")
        print("\n📋 Usuarios de prueba:")
        print("  - admin / admin123456 (Administrador)")
        if medico:
            print(f"  - medico_{medico.id} / medico123456 (Médico)")
        if paciente:
            print(f"  - paciente_{paciente.id} / paciente123456 (Paciente)")

if __name__ == "__main__":
    create_test_users()
