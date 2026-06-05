"""
config/settings.py
Configuraciones de la aplicación Flask por entorno.
"""
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configuración base compartida por todos los entornos."""

    # ── Flask ──────────────────────────────────────────────
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")

    # ── SQLAlchemy ─────────────────────────────────────────
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    @staticmethod
    def _build_db_uri():
        user = os.getenv("DB_USER", "postgres")
        pwd  = os.getenv("DB_PASSWORD", "postgres")
        host = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        name = os.getenv("DB_NAME", "historial_medico_db")
        return f"postgresql://{user}:{pwd}@{host}:{port}/{name}"

    SQLALCHEMY_DATABASE_URI = _build_db_uri.__func__()   # evaluated once at import

    # ── JWT ────────────────────────────────────────────────
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(
        seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600))
    )


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = True          # imprime queries SQL en consola


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "postgresql://postgres:postgres@localhost:5432/historial_medico_test"
    SQLALCHEMY_ECHO = False


class ProductionConfig(Config):
    DEBUG = False
    SQLALCHEMY_ECHO = False


# Mapa de entornos para fácil selección
config_map = {
    "development": DevelopmentConfig,
    "testing":     TestingConfig,
    "production":  ProductionConfig,
}
