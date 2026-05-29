"""
app/__init__.py
Factory de la aplicación Flask – patrón Application Factory.
"""
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flasgger import Swagger

from config.settings import config_map

# ── Extensiones globales (sin app todavía) ─────────────────
db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()


def create_app(env: str | None = None) -> Flask:
    """Crea y configura la aplicación Flask."""

    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_map[env])

    # ── Inicializar extensiones ────────────────────────────
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    # ── Swagger / Flasgger ─────────────────────────────────
    Swagger(app, template={
        "info": {
            "title": "API – Historial Médico",
            "description": (
                "Módulo de Historial Médico para la Plataforma de Telemedicina. "
                "Gestiona pacientes, consultas, diagnósticos, medicamentos y signos vitales."
            ),
            "version": "1.0.0",
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT token. Formato: Bearer <token>",
            }
        },
    })

    # ── Registrar blueprints ───────────────────────────────
    from app.routes.paciente_routes    import paciente_bp
    from app.routes.historial_routes   import historial_bp
    from app.routes.consulta_routes    import consulta_bp
    from app.routes.medicamento_routes import medicamento_bp
    from app.routes.signos_routes      import signos_bp
    from app.routes.auth_routes        import auth_bp

    app.register_blueprint(auth_bp,        url_prefix="/api/auth")
    app.register_blueprint(paciente_bp,    url_prefix="/api/pacientes")
    app.register_blueprint(historial_bp,   url_prefix="/api/historiales")
    app.register_blueprint(consulta_bp,    url_prefix="/api/consultas")
    app.register_blueprint(medicamento_bp, url_prefix="/api/medicamentos")
    app.register_blueprint(signos_bp,      url_prefix="/api/signos-vitales")

    # ── Importar modelos para que Alembic los detecte ──────
    from app.models import paciente, historial, consulta, medicamento, signos_vitales  # noqa

    return app
