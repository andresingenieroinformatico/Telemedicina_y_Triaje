import os
from dotenv import load_dotenv, find_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv(find_dotenv())

db = SQLAlchemy()

def get_db_url():
    db_url = os.getenv("VIDEOCONFERENCIAS_DB_URL") or os.getenv("DATABASE_URL")
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql+pg8000://", 1)
        elif db_url.startswith("postgresql://") and not db_url.startswith("postgresql+pg8000://"):
            db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)
    return db_url

class Config:
    DATABASE_URL = get_db_url()
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # ─── Jitsi Meet ─────────────────────────────────────────────────────────
    JITSI_SERVER_URL = os.getenv("JITSI_SERVER_URL", "https://meet.jit.si")