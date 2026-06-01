#!/bin/sh
set -e
# Script de arranque para contenedor: aplica migraciones y arranca la app
echo "Aplicando migraciones..."
flask db upgrade
echo "Iniciando servidor..."
exec python run.py
