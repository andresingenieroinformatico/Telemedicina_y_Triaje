from flask import Flask
from microservices.videoconferencias.config import Config
from microservices.videoconferencias.models import db
from microservices.videoconferencias.routes import pacientes_bp
from flask_migrate import Migrate

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

migrate = Migrate(app, db)

app.register_blueprint(pacientes_bp)

if __name__ == "__main__":
    app.run(debug=True)