"""
test_endpoints.py – Prueba de todos los endpoints de videoconferencias
Usa SQLite en memoria: no requiere Docker ni PostgreSQL.
Ejecutar:  python test_endpoints.py
"""

import sys
import os
import io

# Forzar UTF-8 en la salida de Windows
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Asegurar que los módulos locales sean encontrados
sys.path.insert(0, os.path.dirname(__file__))

# Forzar SQLite en memoria ANTES de importar la app
os.environ["DATABASE_URL"] = "sqlite://"

from app import create_app  # noqa: E402
from config import db       # noqa: E402

# ─── Configuración ────────────────────────────────────────────────────────────

app = create_app()
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"
app.config["TESTING"] = True

# Crear tablas en SQLite en memoria
with app.app_context():
    db.create_all()

client = app.test_client()

# ─── Helpers ──────────────────────────────────────────────────────────────────

PASS = "[OK]"
FAIL = "[FAIL]"
errors: list[str] = []

def check(label: str, response, expected_status: int, check_fn=None):
    ok = response.status_code == expected_status
    data = response.get_json()
    if ok and check_fn:
        try:
            ok = check_fn(data)
        except Exception as e:
            ok = False
            errors.append(f"{label}: check_fn lanzó {e}")
    status = PASS if ok else FAIL
    print(f"  {status}  {label}  (HTTP {response.status_code})")
    if not ok:
        errors.append(f"{label}: esperado {expected_status}, obtenido {response.status_code}. Body={data}")
    return data

# -----------------------------------------------------------------------------
# SALAS
# -----------------------------------------------------------------------------
print("\n=== SALAS ===")

# GET /salas (vacío)
r = client.get("/api/v1/salas")
check("GET /salas (lista vacía)", r, 200, lambda d: d["data"]["total"] == 0)

# POST /salas – falta campos
r = client.post("/api/v1/salas", json={})
check("POST /salas sin datos -> 400", r, 400)

# POST /salas – ok
r = client.post("/api/v1/salas", json={
    "nombre": "Sala Principal",
    "descripcion": "Sala de prueba",
    "capacidad_max": 5,
})
sala = check("POST /salas -> 201", r, 201, lambda d: d["data"]["nombre"] == "Sala Principal")
SALA_ID = sala["data"]["id"]

# Ya no es posible forzar error de url_sala si la auto-generamos, 
# pero podemos probar que falte un campo requerido
r = client.post("/api/v1/salas", json={
    "descripcion": "Falta nombre",
})
check("POST /salas falta nombre -> 400", r, 400)

# GET /salas (con 1 sala)
r = client.get("/api/v1/salas")
check("GET /salas (1 sala)", r, 200, lambda d: d["data"]["total"] == 1)

# GET /salas/<id>
r = client.get(f"/api/v1/salas/{SALA_ID}")
check(f"GET /salas/{SALA_ID}", r, 200, lambda d: d["data"]["id"] == SALA_ID)

# GET /salas/999 (no existe)
r = client.get("/api/v1/salas/999")
check("GET /salas/999 -> 404", r, 404)

# PATCH /salas/<id>/estado
r = client.patch(f"/api/v1/salas/{SALA_ID}/estado", json={"estado": "cerrada"})
check(f"PATCH /salas/{SALA_ID}/estado -> cerrada", r, 200, lambda d: d["data"]["estado"] == "cerrada")

# PATCH /salas/<id>/estado – valor inválido
r = client.patch(f"/api/v1/salas/{SALA_ID}/estado", json={"estado": "invalido"})
check("PATCH /salas/estado con valor inválido -> 400", r, 400)

# Volver a 'activa' para las siguientes pruebas
client.patch(f"/api/v1/salas/{SALA_ID}/estado", json={"estado": "activa"})

# -----------------------------------------------------------------------------
# SESIONES
# -----------------------------------------------------------------------------
print("\n=== SESIONES ===")

# GET /sesiones (vacío)
r = client.get("/api/v1/sesiones")
check("GET /sesiones (lista vacía)", r, 200, lambda d: d["data"]["total"] == 0)

# GET /sesiones/activas
r = client.get("/api/v1/sesiones/activas")
check("GET /sesiones/activas (sin sesiones)", r, 200, lambda d: len(d["data"]) == 0)

# GET /salas/<id>/sesiones
r = client.get(f"/api/v1/salas/{SALA_ID}/sesiones")
check(f"GET /salas/{SALA_ID}/sesiones (vacía)", r, 200, lambda d: d["data"]["total"] == 0)

# POST /sesiones – sin sala_id
r = client.post("/api/v1/sesiones", json={})
check("POST /sesiones sin sala_id -> 400", r, 400)

# POST /sesiones – sala no existe
r = client.post("/api/v1/sesiones", json={"sala_id": 999})
check("POST /sesiones sala inexistente -> 404", r, 404)

# POST /sesiones – ok
r = client.post("/api/v1/sesiones", json={"sala_id": SALA_ID})
sesion = check("POST /sesiones -> 201", r, 201, lambda d: d["data"]["sala_id"] == SALA_ID)
SESION_ID = sesion["data"]["id"]

# POST /sesiones – sala ya tiene sesión activa
r = client.post("/api/v1/sesiones", json={"sala_id": SALA_ID})
check("POST /sesiones sala con sesión activa -> 409", r, 409)

# GET /sesiones/<id>
r = client.get(f"/api/v1/sesiones/{SESION_ID}")
check(f"GET /sesiones/{SESION_ID}", r, 200, lambda d: d["data"]["id"] == SESION_ID)

# GET /sesiones/999
r = client.get("/api/v1/sesiones/999")
check("GET /sesiones/999 -> 404", r, 404)

# GET /sesiones/activas (con 1 activa)
r = client.get("/api/v1/sesiones/activas")
check("GET /sesiones/activas (1 sesión)", r, 200, lambda d: len(d["data"]) == 1)

# -----------------------------------------------------------------------------
# PARTICIPANTES
# -----------------------------------------------------------------------------
print("\n=== PARTICIPANTES ===")

# GET /sesiones/<id>/participantes (vacío)
r = client.get(f"/api/v1/sesiones/{SESION_ID}/participantes")
check(f"GET /sesiones/{SESION_ID}/participantes (vacío)", r, 200, lambda d: d["data"]["total"] == 0)

# POST /sesiones/<id>/participantes – sin usuario_id
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes", json={"rol": "medico"})
check("POST participantes sin usuario_id -> 400", r, 400)

# POST /sesiones/<id>/participantes – rol inválido
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes",
                json={"usuario_id": 1, "rol": "director"})
check("POST participantes rol inválido -> 400", r, 400)

# POST participante 1 (médico)
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes", json={
    "usuario_id": 101, "rol": "medico", "nombre_usuario": "Dr. García"
})
check("POST participante medico -> 201", r, 201, lambda d: d["data"]["rol"] == "medico")

# POST participante 2 (paciente)
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes", json={
    "usuario_id": 202, "rol": "paciente", "nombre_usuario": "Juan Pérez"
})
check("POST participante paciente -> 201", r, 201)

# POST participante duplicado
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes", json={
    "usuario_id": 101, "rol": "medico"
})
check("POST participante duplicado -> 409", r, 409)

# Verificar capacidad máxima (sala tiene capacidad 5, añadir 3 más)
for uid in [303, 404, 505]:
    client.post(f"/api/v1/sesiones/{SESION_ID}/participantes",
                json={"usuario_id": uid, "rol": "admin"})

# El 6to debería fallar (capacidad 5)
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes",
                json={"usuario_id": 606, "rol": "admin"})
check("POST participante excede capacidad máxima -> 409", r, 409)

# GET participantes con filtro activo=true
r = client.get(f"/api/v1/sesiones/{SESION_ID}/participantes?activo=true")
check("GET participantes?activo=true (5 activos)", r, 200,
      lambda d: d["data"]["total"] == 5)

# PATCH salir (usuario 101)
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/participantes/101")
check("PATCH salir_sesion usuario 101 -> 200", r, 200, lambda d: d["data"]["activo"] is False)

# PATCH salir usuario que ya salió
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/participantes/101")
check("PATCH salir usuario ya inactivo -> 404", r, 404)

# GET participantes activos (deben ser 4 ahora)
r = client.get(f"/api/v1/sesiones/{SESION_ID}/participantes?activo=true")
check("GET participantes?activo=true (4 activos después de salida)", r, 200,
      lambda d: d["data"]["total"] == 4)

# DELETE participante (usuario 202)
r = client.delete(f"/api/v1/sesiones/{SESION_ID}/participantes/202")
check("DELETE participante 202 -> 200", r, 200)

# DELETE participante que ya no existe
r = client.delete(f"/api/v1/sesiones/{SESION_ID}/participantes/202")
check("DELETE participante inexistente -> 404", r, 404)

# -----------------------------------------------------------------------------
# CERRAR SESION
# -----------------------------------------------------------------------------
print("\n=== CERRAR SESION ===")

# PATCH /sesiones/<id>/cerrar
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/cerrar")
check(f"PATCH /sesiones/{SESION_ID}/cerrar -> 200", r, 200,
      lambda d: d["data"]["estado"] == "finalizada")

# PATCH cerrar ya finalizada
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/cerrar")
check("PATCH cerrar sesión ya finalizada -> 409", r, 409)

# PATCH /sesiones/<id>/notas
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/notas", json={"notas_sesion": "Paciente estable."})
check("PATCH /sesiones/<id>/notas -> 200", r, 200, lambda d: d["data"]["notas_sesion"] == "Paciente estable.")

# PATCH /sesiones/<id>/grabacion
r = client.patch(f"/api/v1/sesiones/{SESION_ID}/grabacion", json={"grabacion_url": "https://s3.aws/grabacion.mp4"})
check("PATCH /sesiones/<id>/grabacion -> 200", r, 200, lambda d: d["data"]["grabacion_url"] == "https://s3.aws/grabacion.mp4")

# POST participante en sesión cerrada
r = client.post(f"/api/v1/sesiones/{SESION_ID}/participantes",
                json={"usuario_id": 999, "rol": "medico"})
check("POST participante en sesión cerrada -> 409", r, 409)

# -----------------------------------------------------------------------------
# JITSI
# -----------------------------------------------------------------------------
print("\n=== JITSI ===")

# GET /salas/<id>/join
r = client.get(f"/api/v1/salas/{SALA_ID}/join?usuario_id=1&rol=medico&nombre_usuario=Dr.Test")
check(f"GET /salas/{SALA_ID}/join -> 200", r, 200, lambda d: d["data"]["es_moderador"] is True and "url_acceso" in d["data"])

# POST /sesiones/<id>/link
# Necesitamos una sesión activa
r = client.post("/api/v1/sesiones", json={"sala_id": SALA_ID})
sesion_activa = r.get_json()["data"]["id"]

r = client.post(f"/api/v1/sesiones/{sesion_activa}/link", json={
    "usuario_id": 2,
    "rol": "paciente",
    "nombre_usuario": "PacienteTest"
})
check(f"POST /sesiones/{sesion_activa}/link -> 200", r, 200, lambda d: d["data"]["es_moderador"] is False)

# Cerrar la sesión activa para no romper la prueba de eliminación de sala
client.patch(f"/api/v1/sesiones/{sesion_activa}/cerrar")

# -----------------------------------------------------------------------------
# ELIMINAR SALA
# -----------------------------------------------------------------------------
print("\n=== ELIMINAR ===")

# Crear sala para probar eliminación con sesión activa
r = client.post("/api/v1/salas", json={
    "nombre": "Sala Temp"
})
sala_temp_id = r.get_json()["data"]["id"]
client.post("/api/v1/sesiones", json={"sala_id": sala_temp_id})

r = client.delete(f"/api/v1/salas/{sala_temp_id}")
check("DELETE sala con sesión activa -> 409", r, 409)

# DELETE sala que no existe
r = client.delete("/api/v1/salas/999")
check("DELETE sala inexistente -> 404", r, 404)

# DELETE sala sin sesiones activas (la principal ya tiene sesión cerrada)
r = client.delete(f"/api/v1/salas/{SALA_ID}")
check(f"DELETE /salas/{SALA_ID} (sesión cerrada) -> 200", r, 200)

# -----------------------------------------------------------------------------
# RESUMEN
# -----------------------------------------------------------------------------
print("\n" + "=" * 60)
if errors:
    print(f"\n{FAIL}  {len(errors)} PRUEBA(S) FALLARON:\n")
    for e in errors:
        print(f"   - {e}")
    sys.exit(1)
else:
    print(f"\n{PASS}  Todos los endpoints funcionan correctamente.\n")
