#!/bin/sh

# Configuración de host por defecto
HOST=${DB_HOST:-db}
PORT=${DB_PORT:-5432}

<<<<<<< Updated upstream
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
=======
echo "Esperando a la base de datos en $HOST:$PORT..."
while ! python -c "import socket; s = socket.socket(); s.settimeout(1); s.connect(('$HOST', int($PORT)))" > /dev/null 2>&1; do
    echo "La base de datos no está lista - reintentando en 2s..."
    sleep 2
done

echo "¡Base de datos conectada!"
echo "Aplicando migraciones (flask db upgrade)..."
flask db upgrade || echo "Aviso: No se pudieron aplicar las migraciones o no hay cambios."

echo "Iniciando servidor Flask..."
if [ "$FLASK_ENV" = "production" ]; then
    exec gunicorn --bind 0.0.0.0:5000 "app:create_app('production')"
else
    exec python run.py
fi
>>>>>>> Stashed changes
