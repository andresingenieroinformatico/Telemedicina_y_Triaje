import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()

class Config:
    DATABASE_URL = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:154248@localhost/telemedicina_videoconferencias"
    )
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─── Jitsi Meet ─────────────────────────────────────────────────────────
    JITSI_SERVER_URL = os.getenv("JITSI_SERVER_URL", "https://meet.jit.si")