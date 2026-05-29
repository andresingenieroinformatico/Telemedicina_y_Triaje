"""
app/routes/auth_routes.py
Autenticación básica con JWT (demo – en producción conectar al módulo de usuarios del equipo).
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)

# ── Usuarios demo (sustituir con BD real del equipo) ───────
DEMO_USERS = {
    "medico@demo.com": {"password": "medico123", "rol": "medico"},
    "admin@demo.com":  {"password": "admin123",  "rol": "admin"},
}


@auth_bp.post("/login")
def login():
    """
    Login y obtención de token JWT.
    ---
    tags: [Autenticación]
    parameters:
      - in: body
        name: body
        required: true
        schema:
          properties:
            correo:   {type: string}
            password: {type: string}
    responses:
      200:
        description: Token JWT generado
      401:
        description: Credenciales inválidas
    """
    data = request.get_json(silent=True) or {}
    correo   = data.get("correo", "")
    password = data.get("password", "")

    user = DEMO_USERS.get(correo)
    if not user or user["password"] != password:
        return jsonify({"error": "Credenciales inválidas"}), 401

    token = create_access_token(identity={"correo": correo, "rol": user["rol"]})
    return jsonify({"access_token": token, "tipo": "Bearer"}), 200
