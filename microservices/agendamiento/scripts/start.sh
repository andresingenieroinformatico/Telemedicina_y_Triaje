#!/bin/sh
set -e

# Script de arranque para contenedor: aplica migraciones y arranca la app

# Extraer host y puerto de la URL de la base de datos o usar valores por defecto
DB_HOST="db-postgres"
DB_PORT="5432"

echo "Esperando a que la base de datos en $DB_HOST:$DB_PORT esté lista..."

# Usamos python para verificar la disponibilidad del puerto TCP
while ! python -c "import socket; s = socket.socket(); s.settimeout(1); s.connect(('$DB_HOST', int($DB_PORT)))" > /dev/null 2>&1; do
  echo "Base de datos no disponible aún - reintentando en 2 segundos..."
  sleep 2
done

echo "¡Base de datos conectada!"

echo "Aplicando migraciones..."
flask db upgrade
echo "Iniciando servidor..."
exec python run.py
