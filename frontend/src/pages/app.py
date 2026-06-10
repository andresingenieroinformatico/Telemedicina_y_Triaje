from flask import Flask
from flask_cors import CORS
from microservices.videoconferencias.config import Config
from microservices.videoconferencias.models import db
from microservices.videoconferencias.routes import video_bp
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)  # Habilitar CORS para todas las rutas

app.config.from_object(Config)

db.init_app(app)

migrate = Migrate(app, db)

app.register_blueprint(video_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5004, debug=False) # Asignado al puerto 5004