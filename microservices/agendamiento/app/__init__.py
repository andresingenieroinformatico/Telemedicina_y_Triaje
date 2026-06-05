from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_marshmallow import Marshmallow
from flask_jwt_extended import JWTManager
from flask_cors import CORS

from microservices.videoconferencias.config import config

db = SQLAlchemy()
migrate = Migrate()
ma = Marshmallow()
jwt = JWTManager()


def create_app(config_name: str = "default") -> Flask:
    """Factory para crear la aplicación Flask."""
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Inicializar extensiones
    db.init_app(app)
    migrate.init_app(app, db)
    ma.init_app(app)
    jwt.init_app(app)
    # Allow credentials if configured (required for cookie-based JWT)
    CORS(app, origins=app.config.get("CORS_ORIGINS", "*"), supports_credentials=app.config.get("CORS_SUPPORTS_CREDENTIALS", True))

    # Registrar blueprints
    from app.routes.auth_routes import auth_bp
    from app.routes.agendamiento_routes import agendamiento_bp
    from app.routes.disponibilidad_routes import disponibilidad_bp
    from app.routes.especialidad_routes import especialidad_bp
    from app.routes.medico_routes import medico_bp
    from app.routes.paciente_routes import paciente_bp
    from app.routes.health_routes import health_bp

    app.register_blueprint(auth_bp, url_prefix="/api/v1/auth")
    app.register_blueprint(health_bp, url_prefix="/api/v1")
    app.register_blueprint(paciente_bp, url_prefix="/api/v1/pacientes")
    app.register_blueprint(medico_bp, url_prefix="/api/v1/medicos")
    app.register_blueprint(especialidad_bp, url_prefix="/api/v1/especialidades")
    app.register_blueprint(disponibilidad_bp, url_prefix="/api/v1/disponibilidad")
    app.register_blueprint(agendamiento_bp, url_prefix="/api/v1/agendamientos")

    # Importar modelos para que Alembic los detecte
    from app.models import (  # noqa: F401
        Paciente, Medico, Especialidad,
        DisponibilidadMedico, Agendamiento, HistorialAgendamiento, Usuario
    )

    @app.errorhandler(404)
    def not_found(e):
        return {"error": "Recurso no encontrado", "code": 404}, 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {"error": "Método no permitido", "code": 405}, 405

    @app.errorhandler(500)
    def internal_error(e):
        return {"error": "Error interno del servidor", "code": 500}, 500

    @jwt.unauthorized_loader
    def unauthorized_callback(reason):
        return jsonify({"success": False, "message": "Token no proporcionado o inválido.", "reason": reason}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(reason):
        return jsonify({"success": False, "message": "Token inválido.", "reason": reason}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token expirado."}), 401

    @jwt.needs_fresh_token_loader
    def needs_fresh_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token requiere ser fresco."}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token revocado."}), 401

    return app
