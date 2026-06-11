#!/bin/sh
set -e
echo "Creando entorno virtual .venv y instalando dependencias..."
python3 -m venv .venv
. .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
echo "Entorno preparado. Active con: source .venv/bin/activate"
