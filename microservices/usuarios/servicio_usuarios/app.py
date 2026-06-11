from flask import Flask
from flask_cors import CORS
from config import Config 
from models import db
from routes import pacientes_bp
from flask_migrate import Migrate

app = Flask(__name__)
CORS(app)

app.config.from_object(Config)

db.init_app(app)

migrate = Migrate(app, db)

app.register_blueprint(pacientes_bp, url_prefix="/api/v1")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=False)