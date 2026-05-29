from flask import Flask
from microservices.videoconferencias.config import Config, db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    from microservices.videoconferencias.routes import video_bp
    app.register_blueprint(video_bp)

    with app.app_context():
        db.create_all()

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="0.0.0.0", port=5000)