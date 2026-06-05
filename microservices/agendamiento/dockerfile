FROM python:3.12-slim AS builder
WORKDIR /install

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt ./
RUN pip install --upgrade pip wheel \
    && pip wheel --wheel-dir=/install/wheels -r requirements.txt

FROM python:3.12-slim AS runtime
WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN addgroup --system app && adduser --system --ingroup app app

COPY --from=builder /install/wheels /wheels
RUN pip install --no-cache-dir /wheels/* \
    && rm -rf /wheels

COPY . .
RUN sed -i 's/\r$//' ./scripts/start.sh \
    && chmod +x ./scripts/start.sh \
    && chown -R app:app /usr/src/app

USER app

ENV FLASK_APP=run.py

EXPOSE 5000
ENTRYPOINT ["./scripts/start.sh"]
