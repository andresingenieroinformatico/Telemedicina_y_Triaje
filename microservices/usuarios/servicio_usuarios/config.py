import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:154248@localhost/telemedicina_usuarios"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    
    