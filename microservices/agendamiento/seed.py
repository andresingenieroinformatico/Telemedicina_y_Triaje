"""
Script de seed para poblar la base de datos con datos de prueba.
Ejecutar: python seed.py
"""
import os
import sys
from datetime import date, time

sys.path.insert(0, os.path.dirname(__file__))

from microservices.videoconferencias.app import create_app, db
from app.models import Especialidad, Medico, Paciente, DisponibilidadMedico, Usuario

app = create_app("development")


def seed():
    with app.app_context():
        print("🗑️  Limpiando tablas...")
        db.drop_all()
        db.create_all()
        print("✅  Tablas creadas.")

        # Especialidades
        especialidades_data = [
            {"nombre": "Medicina General", "descripcion": "Atención médica primaria y preventiva"},
            {"nombre": "Pediatría", "descripcion": "Atención médica para niños y adolescentes"},
            {"nombre": "Cardiología", "descripcion": "Enfermedades del corazón y sistema cardiovascular"},
            {"nombre": "Dermatología", "descripcion": "Enfermedades de la piel"},
            {"nombre": "Psiquiatría", "descripcion": "Salud mental y trastornos psiquiátricos"},
            {"nombre": "Neurología", "descripcion": "Enfermedades del sistema nervioso"},
        ]
        especialidades = []
        for e in especialidades_data:
            esp = Especialidad(**e)
            db.session.add(esp)
            especialidades.append(esp)
        db.session.flush()
        print(f"✅  {len(especialidades)} especialidades creadas.")

        # Médicos
        medicos_data = [
            {
                "numero_registro": "RM-001234",
                "nombres": "Darwin",
                "apellidos": "Torres Gómez",
                "email": "darwin.torres@telemedicina.co",
                "telefono": "3001234567",
                "especialidad_id": especialidades[0].id,
                "duracion_consulta_min": 30,
                "tarifa_consulta": 80000,
            },
            {
                "numero_registro": "RM-002345",
                "nombres": "Juan",
                "apellidos": "Martínez López",
                "email": "juan.martinez@telemedicina.co",
                "telefono": "3109876543",
                "especialidad_id": especialidades[2].id,
                "duracion_consulta_min": 45,
                "tarifa_consulta": 150000,
            },
            {
                "numero_registro": "RM-003456",
                "nombres": "Juanita",
                "apellidos": "Rodríguez Pérez",
                "email": "juanita.rodriguez@telemedicina.co",
                "telefono": "3155556789",
                "especialidad_id": especialidades[1].id,
                "duracion_consulta_min": 30,
                "tarifa_consulta": 90000,
            },
        ]
        medicos = []
        for m in medicos_data:
            med = Medico(**m)
            db.session.add(med)
            medicos.append(med)
        db.session.flush()
        print(f"✅  {len(medicos)} médicos creados.")

        # Disponibilidades
        dias = ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES"]
        for medico in medicos:
            for dia in dias:
                disp = DisponibilidadMedico(
                    medico_id=medico.id,
                    dia_semana=dia,
                    hora_inicio=time(8, 0),
                    hora_fin=time(12, 0),
                )
                db.session.add(disp)
                disp2 = DisponibilidadMedico(
                    medico_id=medico.id,
                    dia_semana=dia,
                    hora_inicio=time(14, 0),
                    hora_fin=time(18, 0),
                )
                db.session.add(disp2)
        db.session.flush()
        print("✅  Disponibilidades creadas (lun-vie 8-12 y 14-18).")

        # Pacientes
        pacientes_data = [
            {
                "numero_documento": "1098765432",
                "tipo_documento": "CC",
                "nombres": "Ana María",
                "apellidos": "González Ruiz",
                "fecha_nacimiento": date(1990, 5, 15),
                "genero": "F",
                "email": "ana.gonzalez@email.com",
                "telefono": "3201234567",
                "ciudad": "Barrancabermeja",
            },
            {
                "numero_documento": "1054321098",
                "tipo_documento": "CC",
                "nombres": "Carlos",
                "apellidos": "Pérez Castro",
                "fecha_nacimiento": date(1985, 11, 20),
                "genero": "M",
                "email": "carlos.perez@email.com",
                "telefono": "3112345678",
                "ciudad": "Bucaramanga",
            },
            {
                "numero_documento": "1067891234",
                "tipo_documento": "CC",
                "nombres": "Laura Sofía",
                "apellidos": "Ramírez Torres",
                "fecha_nacimiento": date(2000, 3, 8),
                "genero": "F",
                "email": "laura.ramirez@email.com",
                "telefono": "3189876543",
                "ciudad": "Medellín",
            },
        ]
        for p in pacientes_data:
            pac = Paciente(**p)
            db.session.add(pac)
        db.session.flush()
        print(f"✅  {len(pacientes_data)} pacientes creados.")

        # Usuarios de prueba
        admin = Usuario(
            username="admin",
            email="admin@telemedicina.co",
            rol="ADMIN",
            activo=True,
        )
        admin.set_password("admin123456")
        db.session.add(admin)

        if medicos:
            medico_user = Usuario(
                username=f"medico_{medicos[0].id}",
                email=medicos[0].email,
                rol="MEDICO",
                medico_id=medicos[0].id,
                activo=True,
            )
            medico_user.set_password("medico123456")
            db.session.add(medico_user)

        primer_paciente = Paciente.query.first()
        if primer_paciente:
            paciente_user = Usuario(
                username=f"paciente_{primer_paciente.id}",
                email=primer_paciente.email,
                rol="PACIENTE",
                paciente_id=primer_paciente.id,
                activo=True,
            )
            paciente_user.set_password("paciente123456")
            db.session.add(paciente_user)

        db.session.commit()
        print("\n🎉  Seed completado exitosamente.")
        print("📋  Datos de prueba disponibles:")
        print("     Admin: admin / admin123456")
        if medicos:
            print(f"     Médico: medico_{medicos[0].id} / medico123456")
        if primer_paciente:
            print(f"     Paciente: paciente_{primer_paciente.id} / paciente123456")


if __name__ == "__main__":
    seed()
