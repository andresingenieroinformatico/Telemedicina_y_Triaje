Write-Output "Creando entorno virtual .venv e instalando dependencias..."
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -r requirements.txt
Write-Output "Entorno preparado. Active con: .\\.venv\\Scripts\\Activate.ps1"
