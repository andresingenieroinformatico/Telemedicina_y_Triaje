import os
from dotenv import load_dotenv
from flask_sqlalchemy import SQLAlchemy

load_dotenv()

db = SQLAlchemy()

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "")
    SQLALCHEMY_DATABASE_URI = DATABASE_URL
    SQLALCHEMY_TRACK_MODIFICATIONS = False