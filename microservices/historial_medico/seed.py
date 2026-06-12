"""
seed.py
Poblar la base de datos con datos de prueba.
Uso: python seed.py
"""
from datetime import date
from app import create_app, db
from app.models import Paciente, HistorialMedico, Consulta, Medicamento, SignosVitales


def seed():
    app = create_app("development")
    with app.app_context():
        db.create_all()

        # ── Paciente 1 ─────────────────────────────────────
        p1 = Paciente(
            cedula="1234567890",
            nombres="Carlos",
            apellidos="Ramírez Torres",
            fecha_nacimiento=date(1985, 3, 12),
            genero="M",
            tipo_sangre="O+",
            correo="carlos.ramirez@demo.com",
            telefono="0991234567",
            direccion="Av. Amazonas N24-01, Quito",
        )
        db.session.add(p1)
        db.session.flush()

        h1 = HistorialMedico(
            paciente_id=p1.id,
            alergias="Penicilina, Aspirina",
            enfermedades_cronicas="Hipertensión arterial grado II",
            cirugias_previas="Apendicectomía (2010)",
            medicamentos_actuales="Losartán 50 mg / día",
            habitos="Ex-fumador. Sedentario.",
            antecedentes_familiares="Padre con diabetes tipo 2. Madre con hipertensión.",
            observaciones="Paciente cooperador. Control cada 3 meses.",
        )
        db.session.add(h1)
        db.session.flush()

        c1 = Consulta(
            historial_id=h1.id,
            medico_id=1,
            motivo="Control de hipertensión",
            tipo="telemedicina",
            sintomas="Cefalea leve, mareos ocasionales",
            diagnostico="Hipertensión arterial controlada",
            tratamiento="Continuar con Losartán 50 mg. Dieta baja en sodio.",
            estado="completada",
        )
        db.session.add(c1)
        db.session.flush()

        sv1 = SignosVitales(
            historial_id=h1.id,
            frecuencia_cardiaca=78,
            presion_sistolica=138,
            presion_diastolica=88,
            temperatura=36.5,
            saturacion_oxigeno=98.2,
            frecuencia_respiratoria=16,
            peso=82.5,
            altura=1.75,
            fuente="traje_automatizado",
        )
        db.session.add(sv1)

        # ── Medicamentos de catálogo ────────────────────────
        meds = [
            Medicamento(nombre="Losartán",   principio_activo="Losartán potásico",
                        forma_farmaceutica="Tableta", concentracion="50 mg"),
            Medicamento(nombre="Metformina", principio_activo="Metformina clorhidrato",
                        forma_farmaceutica="Tableta", concentracion="850 mg"),
            Medicamento(nombre="Amoxicilina",principio_activo="Amoxicilina",
                        forma_farmaceutica="Cápsula",  concentracion="500 mg"),
            Medicamento(nombre="Ibuprofeno", principio_activo="Ibuprofeno",
                        forma_farmaceutica="Tableta", concentracion="400 mg",
                        requiere_receta=False),
            Medicamento(nombre="Paracetamol",principio_activo="Acetaminofén",
                        forma_farmaceutica="Tableta", concentracion="500 mg",
                        requiere_receta=False),
        ]
        db.session.add_all(meds)
        db.session.commit()

        print("✅  Seed completado exitosamente.")
        print(f"   → Paciente:  {p1.nombres} {p1.apellidos} (ID {p1.id})")
        print(f"   → Historial: ID {h1.id}")
        print(f"   → Consulta:  ID {c1.id}")
        print(f"   → Medicamentos: {len(meds)} registrados")


if __name__ == "__main__":
    seed()
