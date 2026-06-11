import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flasgger import Swagger
from config.settings import config_map

db      = SQLAlchemy()
migrate = Migrate()
jwt     = JWTManager()


def create_app(env=None):
    env = env or os.getenv("FLASK_ENV", "development")
    app = Flask(__name__)
    app.config.from_object(config_map[env])

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    Swagger(app, template={
        "info": {
            "title": "API – Historial Médico",
            "description": "Plataforma de Telemedicina con Traje Automatizado",
            "version": "2.0.0",
        },
        "securityDefinitions": {
            "Bearer": {
                "type": "apiKey",
                "name": "Authorization",
                "in": "header",
                "description": "JWT – Formato: Bearer <token>",
            }
        },
    })

    # Blueprints
    from app.routes.auth_routes      import auth_bp
    from app.routes.usuario_routes   import usuario_bp
    from app.routes.paciente_routes  import paciente_bp
    from app.routes.medico_routes    import medico_bp
    from app.routes.historial_routes import historial_bp
    from app.routes.receta_routes    import receta_bp
    from app.routes.cita_routes      import cita_bp

    app.register_blueprint(auth_bp,      url_prefix="/api/auth")
    app.register_blueprint(usuario_bp,   url_prefix="/api/usuarios")
    app.register_blueprint(paciente_bp,  url_prefix="/api/pacientes")
    app.register_blueprint(medico_bp,    url_prefix="/api/medicos")
    app.register_blueprint(historial_bp, url_prefix="/api/historial")
    app.register_blueprint(receta_bp,    url_prefix="/api/recetas")
    app.register_blueprint(cita_bp,      url_prefix="/api/citas")

    # Importar modelos para migraciones
    from app.models import usuario, paciente, medico, historial, receta, cita  # noqa

    return app
