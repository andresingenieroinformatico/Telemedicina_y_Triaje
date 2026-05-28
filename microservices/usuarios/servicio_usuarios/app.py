from flask import Flask
from config import Config
from models import db
from routes import pacientes_bp
from flask_migrate import Migrate

app = Flask(__name__)

app.config.from_object(Config)

db.init_app(app)

migrate = Migrate(app, db)

app.register_blueprint(pacientes_bp)

if __name__ == "__main__":
    app.run(debug=True)