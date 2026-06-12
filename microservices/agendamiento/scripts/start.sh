#!/bin/sh
set -e

# Script de arranque para contenedor: aplica migraciones y arranca la app

# Solo esperar por la DB si NO estamos en Render (entorno local con Docker)
if [ -z "$RENDER" ]; then
    DB_HOST="db-postgres"
    DB_PORT="5432"
    echo "Esperando a que la base de datos en $DB_HOST:$DB_PORT esté lista..."
    while ! python -c "import socket; s = socket.socket(); s.settimeout(1); s.connect(('$DB_HOST', int($DB_PORT)))" > /dev/null 2>&1; do
      echo "Base de datos no disponible aún - reintentando en 2 segundos..."
      sleep 2
    done
fi

echo "¡Base de datos conectada!"
echo "Aplicando migraciones..."
flask db upgrade

echo "Iniciando servidor..."
if [ -n "$RENDER" ]; then
    exec gunicorn --bind 0.0.0.0:$PORT run:app
else
    exec python run.py
fi
