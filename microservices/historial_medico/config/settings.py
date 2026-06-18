import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "jwt-dev-secret")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(seconds=int(os.getenv("JWT_ACCESS_TOKEN_EXPIRES", 3600)))

    @staticmethod
    def build_uri():
        u = os.getenv("DB_USER", "postgres")
        p = os.getenv("DB_PASSWORD", "postgres")
        h = os.getenv("DB_HOST", "localhost")
        port = os.getenv("DB_PORT", "5432")
        d = os.getenv("DB_NAME", "historial_medico_db")
        return f"postgresql://{u}:{p}@{h}:{port}/{d}"

    SQLALCHEMY_DATABASE_URI = build_uri.__func__()


class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_ECHO = False


class TestingConfig(Config):
    TESTING = True
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


config_map = {
    "development": DevelopmentConfig,
    "testing":     TestingConfig,
    "production":  ProductionConfig,
}
