"""
migrate_db.py – Script de migración de base de datos
=====================================================
Agrega las columnas nuevas a una BD PostgreSQL existente:
  - salas.jitsi_room_name     VARCHAR(255) UNIQUE
  - sesiones.notas_sesion     TEXT
  - sesiones.grabacion_url    VARCHAR(500)

Uso:
    python migrate_db.py

Requiere que DATABASE_URL en .env apunte a la BD de destino.
Es seguro correrlo varias veces (usa ADD COLUMN IF NOT EXISTS).
"""

import os
import sys
from sqlalchemy import text

# Asegurar que el directorio raíz del proyecto esté en el path para importaciones
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "../../"))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from microservices.videoconferencias.app import create_app
from microservices.videoconferencias.config import db

# ─── Columnas a agregar ───────────────────────────────────────────────────────
MIGRATIONS = [
    {
        "descripcion": "salas.jitsi_room_name",
        "sql": "ALTER TABLE salas ADD COLUMN IF NOT EXISTS jitsi_room_name VARCHAR(255);",
    },
    {
        "descripcion": "indice unico salas.jitsi_room_name",
        "sql": """
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM pg_indexes
                    WHERE tablename = 'salas' AND indexname = 'uq_salas_jitsi_room_name'
                ) THEN
                    CREATE UNIQUE INDEX uq_salas_jitsi_room_name ON salas(jitsi_room_name)
                    WHERE jitsi_room_name IS NOT NULL;
                END IF;
            END $$;
        """,
    },
    {
        "descripcion": "sesiones.notas_sesion",
        "sql": "ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS notas_sesion TEXT;",
    },
    {
        "descripcion": "sesiones.grabacion_url",
        "sql": "ALTER TABLE sesiones ADD COLUMN IF NOT EXISTS grabacion_url VARCHAR(500);",
    },
]


def run_migrations():
    app = create_app()

    with app.app_context():
        print("=" * 55)
        print("  Migración de BD – Videoconferencias")
        print("=" * 55)
        print(f"  BD: {app.config.get('SQLALCHEMY_DATABASE_URI', '').split('@')[-1]}\n")

        try:
            with db.engine.connect() as conn:
                for m in MIGRATIONS:
                    try:
                        conn.execute(text(m["sql"]))
                        conn.commit()
                        print(f"  [OK] {m['descripcion']}")
                    except Exception as e:
                        msg = str(e).splitlines()[0]
                        print(f"  [!!] {m['descripcion']} — {msg}")

            print("\n  Migración completada.")
            print("=" * 55)

        except Exception as e:
            print(f"\n  [ERROR] No se pudo conectar a la BD: {e}")
            print("  Asegúrate de que DATABASE_URL en .env sea correcto")
            print("  y que la BD esté disponible.")
            sys.exit(1)


if __name__ == "__main__":
    run_migrations()
