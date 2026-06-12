import os
from flask import Flask
from flask_migrate import Migrate
from flask_cors import CORS
from config import Config, db
from routes import video_bp


def create_app():
    app = Flask(__name__)

    # Permitir peticiones desde el frontend (CORS)
    CORS(app, supports_credentials=True)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
    app.config.from_object(Config)

    db.init_app(app)
    Migrate(app, db)  # Habilita: flask db init / migrate / upgrade

    with app.app_context():
        db.create_all()

    app.register_blueprint(video_bp, url_prefix="/api/v1")

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


# Expose app at module level for gunicorn (gunicorn app:app)
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5004))
    app.run(debug=True, host="0.0.0.0", port=port)
