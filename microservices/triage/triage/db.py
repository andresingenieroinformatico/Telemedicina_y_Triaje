import psycopg2
import psycopg2.extras
import os
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    db_url = os.getenv("TRIAGE_DB_URL") or os.getenv("DATABASE_URL")
    if db_url:
        if db_url.startswith("postgres://"):
            db_url = db_url.replace("postgres://", "postgresql://", 1)
        parsed = urllib.parse.urlparse(db_url)
        return psycopg2.connect(
            host=parsed.hostname,
            port=parsed.port,
            dbname=parsed.path[1:],
            user=parsed.username,
            password=parsed.password
        )
    else:
        return psycopg2.connect(
            host=os.getenv("DB_HOST"),
            port=os.getenv("DB_PORT"),
            dbname=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD")
        )

def init_db():
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS evaluacion_triage (
                id_evaluacion SERIAL PRIMARY KEY,
                id_paciente INTEGER NOT NULL,
                nivel INTEGER NOT NULL,
                sintomas_reportados TEXT,
                temperatura NUMERIC(4,2),
                frecuencia_cardiaca INTEGER,
                fecha_evaluacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        conn.commit()
        print("Base de datos de Triage inicializada correctamente.")
    except Exception as e:
        print("Error al inicializar la base de datos de triage:", e)
        if 'conn' in locals() and conn:
            conn.rollback()
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()