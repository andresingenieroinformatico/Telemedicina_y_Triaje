"""
run.py
Punto de entrada de la aplicación Flask.
Uso:
    flask run          (modo desarrollo, con FLASK_ENV=development)
    python run.py      (directo)
"""
import os
from microservices.videoconferencias.app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config.get("DEBUG", False))
