# Usar una imagen oficial de Python ligera
FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y asegurar que los logs se muestren inmediatamente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto de la aplicación al contenedor
COPY . .

# Exponer el puerto
EXPOSE 5000

# Ejecutar la app con gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
