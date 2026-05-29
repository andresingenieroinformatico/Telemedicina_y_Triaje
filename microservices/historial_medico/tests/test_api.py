"""
tests/test_api.py
Tests básicos de la API (requiere DB de testing configurada).
Uso: pytest tests/
"""
import pytest
from microservices.videoconferencias.app import create_app, db as _db


@pytest.fixture(scope="session")
def app():
    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        yield application
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def auth_header(client):
    """Obtener token JWT de prueba."""
    res = client.post("/api/auth/login", json={
        "correo": "admin@demo.com",
        "password": "admin123"
    })
    token = res.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── Tests de Autenticación ─────────────────────────────────
class TestAuth:
    def test_login_exitoso(self, client):
        res = client.post("/api/auth/login", json={
            "correo": "medico@demo.com", "password": "medico123"
        })
        assert res.status_code == 200
        assert "access_token" in res.get_json()

    def test_login_fallido(self, client):
        res = client.post("/api/auth/login", json={
            "correo": "nadie@demo.com", "password": "wrongpass"
        })
        assert res.status_code == 401

    def test_ruta_sin_token(self, client):
        res = client.get("/api/pacientes/")
        assert res.status_code == 401


# ── Tests de Pacientes ─────────────────────────────────────
class TestPacientes:
    def test_crear_paciente(self, client, auth_header):
        res = client.post("/api/pacientes/", json={
            "cedula":           "9999999999",
            "nombres":          "Test",
            "apellidos":        "Usuario",
            "fecha_nacimiento": "1990-06-15",
            "genero":           "M",
            "correo":           "test@demo.com",
        }, headers=auth_header)
        assert res.status_code == 201
        data = res.get_json()
        assert data["cedula"] == "9999999999"

    def test_cedula_duplicada(self, client, auth_header):
        payload = {
            "cedula":           "9999999999",
            "nombres":          "Otro",
            "apellidos":        "Paciente",
            "fecha_nacimiento": "1995-01-01",
            "genero":           "F",
        }
        res = client.post("/api/pacientes/", json=payload, headers=auth_header)
        assert res.status_code == 409

    def test_listar_pacientes(self, client, auth_header):
        res = client.get("/api/pacientes/", headers=auth_header)
        assert res.status_code == 200
        assert "pacientes" in res.get_json()

    def test_obtener_paciente(self, client, auth_header):
        res = client.get("/api/pacientes/1", headers=auth_header)
        assert res.status_code in (200, 404)

    def test_validacion_genero_invalido(self, client, auth_header):
        res = client.post("/api/pacientes/", json={
            "cedula":           "1111111111",
            "nombres":          "Test",
            "apellidos":        "Error",
            "fecha_nacimiento": "2000-01-01",
            "genero":           "X",   # inválido
        }, headers=auth_header)
        assert res.status_code == 400


# ── Tests de Signos Vitales ────────────────────────────────
class TestSignosVitales:
    def test_registrar_signos_historial_invalido(self, client, auth_header):
        res = client.post("/api/signos-vitales/", json={
            "historial_id":        9999,
            "frecuencia_cardiaca": 72,
            "temperatura":         36.7,
        }, headers=auth_header)
        assert res.status_code == 404

    def test_validacion_temperatura_fuera_de_rango(self, client, auth_header):
        res = client.post("/api/signos-vitales/", json={
            "historial_id": 1,
            "temperatura":  99.0,  # fuera del rango 30-45
        }, headers=auth_header)
        assert res.status_code in (400, 404)
