"""
Script de prueba para verificar que los endpoints funcionan.
Ejecutar en otra terminal: python test_api.py
"""
import requests
import json
import sys

BASE_URL = "http://localhost:5000/api/v1"

def print_response(title, response):
    """Imprime respuesta formateada."""
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print(f"{'='*60}")
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2, ensure_ascii=False))
    except:
        print(response.text)

def test_api():
    """Ejecuta pruebas de endpoints."""
    token = None
    errors = 0
    
    # 1. Health Check
    r = requests.get(f"{BASE_URL}/health")
    print_response("Health Check", r)
    if r.status_code != 200: errors += 1
    
    # 2. Login
    print(f"\n📝 Intentando login con admin/admin123456...")
    r = requests.post(
        f"{BASE_URL}/auth/login",
        json={"username": "admin", "password": "admin123456"}
    )
    print_response("Login", r)
    if r.status_code == 200:
        token = r.json()["data"]["access_token"]
        print(f"✅ Token obtenido: {token[:50]}...")
    else:
        errors += 1
    
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    # 3. Get Especialidades
    r = requests.get(f"{BASE_URL}/especialidades", headers=headers)
    print_response("GET /especialidades", r)
    if r.status_code != 200: errors += 1
    
    # 4. Get Médicos
    r = requests.get(f"{BASE_URL}/medicos", headers=headers)
    print_response("GET /medicos", r)
    if r.status_code != 200: errors += 1
    
    # 5. Get Pacientes
    r = requests.get(f"{BASE_URL}/pacientes", headers=headers)
    print_response("GET /pacientes", r)
    if r.status_code != 200: errors += 1
    
    # 6. Get Agendamientos
    r = requests.get(f"{BASE_URL}/agendamientos", headers=headers)
    print_response("GET /agendamientos", r)
    if r.status_code != 200: errors += 1
    
    # 7. Get Me (usuario autenticado)
    if token:
        r = requests.get(f"{BASE_URL}/auth/me", headers=headers)
        print_response("GET /auth/me (Usuario autenticado)", r)
    
    # 8. Register (nuevo paciente)
    print(f"\n📝 Intentando registrar un nuevo usuario...")
    r = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": "nuevopaciente",
            "email": "nuevopaciente@test.com",
            "password": "password123456"
        }
    )
    print_response("POST /auth/register (Nuevo usuario)", r)
    if r.status_code not in [201, 409]: errors += 1
    
    print(f"\n{'='*60}")
    if errors == 0:
        print("✅ Todas las pruebas pasaron exitosamente!")
    else:
        print(f"❌ Se encontraron {errors} errores durante las pruebas.")
        sys.exit(1)
    print(f"{'='*60}")

if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("❌ Error: No se pudo conectar al servidor en http://localhost:5000")
        print("   Asegúrate de que el servidor está ejecutándose: python run.py")
    except Exception as e:
        print(f"❌ Error: {e}")
