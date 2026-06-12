import os
import urllib.parse
from dotenv import load_dotenv

# Cargar variables de entorno del archivo .env
load_dotenv()

DATABASES = {
    "Usuarios & Autenticacion": "USUARIOS_DB_URL",
    "Agendamiento de Citas": "AGENDAMIENTO_DB_URL",
    "Historial Medico": "HISTORIAL_DB_URL",
    "Videoconferencias": "VIDEOCONFERENCIAS_DB_URL",
    "Triaje": "TRIAGE_DB_URL"
}

def clean_pg8000_url(url):
    """Limpia y normaliza el string para pg8000."""
    if not url:
        return None
    if url.startswith("postgresql+pg8000://"):
        return url
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+pg8000://", 1)
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+pg8000://", 1)
    return url

def test_database(name, env_var):
    db_url = os.getenv(env_var)
    print("=" * 60)
    print(f"Probando base de datos: {name} ({env_var})")
    
    if not db_url:
        print(f"[ERROR] La variable de entorno '{env_var}' no esta definida.")
        return False
        
    # Verificar si es una URL de marcador de posicion
    if "[" in db_url or "]" in db_url or "usuario" in db_url or "region" in db_url:
        print(f"[INFO] La URL parece contener marcadores de posicion (placeholders) sin configurar:")
        print(f"   {db_url}")
        print("[ERROR] Configura las credenciales correctas en tu archivo .env")
        return False
        
    cleaned_url = clean_pg8000_url(db_url)
    print(f"[INFO] Intentando conectar a: {db_url.split('@')[-1] if '@' in db_url else db_url} ...")
    
    try:
        import pg8000
        # Parsear URL
        parsed = urllib.parse.urlparse(db_url.replace("postgresql+pg8000://", "postgresql://"))
        username = parsed.username
        password = parsed.password
        database = parsed.path[1:] if parsed.path else None
        hostname = parsed.hostname
        port = parsed.port or 5432
        
        conn = pg8000.connect(
            user=username,
            password=password,
            host=hostname,
            port=port,
            database=database,
            timeout=5
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        print(f"[SUCCESS] CONEXION EXITOSA!")
        print(f"   Version del Servidor: {version[0]}")
        
        # Obtener listado de tablas
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        if tables:
            print(f"   Tablas encontradas ({len(tables)}):")
            for t in tables:
                print(f"     - {t[0]}")
        else:
            print("   [INFO] No se encontraron tablas publicas creadas.")
            
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"[ERROR] ERROR DE CONEXION: {str(e)}")
        return False

if __name__ == "__main__":
    print("Iniciando prueba de conexiones a Bases de Datos...")
    results = {}
    for name, env_var in DATABASES.items():
        results[name] = test_database(name, env_var)
        print()
        
    print("=" * 60)
    print("RESUMEN DE CONEXIONES:")
    for name, success in results.items():
        status = "CONECTADO" if success else "CONEXION FALLIDA"
        print(f"  - {name}: {status}")
    print("=" * 60)
