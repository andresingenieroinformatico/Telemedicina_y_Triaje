import os
from microservices.videoconferencias.app import create_app

app = create_app(os.getenv("FLASK_ENV", "development"))

if __name__ == "__main__":
    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", 5000))
    app.run(host=host, port=port, debug=app.config.get("DEBUG", False))
