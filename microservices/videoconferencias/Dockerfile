FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5004

CMD ["sh", "-c", "gunicorn -b 0.0.0.0:${PORT:-5004} 'app:create_app()'"]