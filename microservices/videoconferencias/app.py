from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from microservices.videoconferencias.config import Config, db


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Permitir peticiones desde el frontend (CORS)
    CORS(app)

    db.init_app(app)
    Migrate(app, db)  # Habilita: flask db init / migrate / upgrade

    from microservices.videoconferencias.routes import video_bp
    app.register_blueprint(video_bp, url_prefix="/api/v1")

    with app.app_context():
        db.create_all()

    @app.errorhandler(404)
    def not_found(e):
        return {"success": False, "error": "Recurso no encontrado."}, 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return {"success": False, "error": "Método no permitido."}, 405

    @app.errorhandler(500)
    def internal_error(e):
        return {"success": False, "error": "Error interno del servidor."}, 500

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5004)