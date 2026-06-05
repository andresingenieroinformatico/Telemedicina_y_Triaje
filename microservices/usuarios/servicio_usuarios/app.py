from flask import Flask
<<<<<<< HEAD:servicio_usuarios/app.py
from config import Config 
from models import db
from routes import pacientes_bp
=======
from microservices.videoconferencias.config import Config
from microservices.videoconferencias.models import db
from microservices.videoconferencias.routes import pacientes_bp
>>>>>>> origin/main:microservices/usuarios/servicio_usuarios/app.py
from flask_migrate import Migrate

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

migrate = Migrate(app, db)

app.register_blueprint(pacientes_bp)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)