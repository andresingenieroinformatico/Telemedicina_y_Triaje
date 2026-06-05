# 🏥 Módulo de Historial Médico – API REST

Módulo desarrollado en **Python + Flask + PostgreSQL** como parte de la plataforma de telemedicina con traje automatizado.

---

## 📁 Estructura del proyecto

```
historial_medico/
├── app/
│   ├── __init__.py          # Factory de Flask + extensiones
│   ├── models/
│   │   ├── paciente.py      # Datos demográficos del paciente
│   │   ├── historial.py     # Ficha clínica principal
│   │   ├── consulta.py      # Consultas médicas (telemedicina/presencial)
│   │   ├── medicamento.py   # Catálogo y prescripciones
│   │   └── signos_vitales.py# Mediciones del traje automatizado
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── paciente_routes.py
│   │   ├── historial_routes.py
│   │   ├── consulta_routes.py
│   │   ├── medicamento_routes.py
│   │   └── signos_routes.py
│   └── schemas/             # Validación y serialización (Marshmallow)
├── config/
│   └── settings.py          # Config por entorno (dev/test/prod)
├── tests/
│   └── test_api.py
├── migrations/              # Generado por Flask-Migrate (Alembic)
├── .env.example
├── requirements.txt
├── run.py                   # Punto de entrada
└── seed.py                  # Datos de prueba
```

---

## ⚙️ Instalación y configuración

### 1. Requisitos previos
- Python 3.11+
- PostgreSQL 14+

### 2. Clonar e instalar dependencias

```bash
git clone <url-del-repo>
cd historial_medico

python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

pip install -r requirements.txt
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 4. Crear la base de datos en PostgreSQL

```sql
CREATE DATABASE historial_medico_db;
CREATE DATABASE historial_medico_test;   -- para tests
```

### 5. Aplicar migraciones

```bash
flask db init        # solo la primera vez
flask db migrate -m "inicial"
flask db upgrade
```

### 6. Poblar con datos de prueba (opcional)

```bash
python seed.py
```

### 7. Ejecutar la API

```bash
flask run
# o
python run.py
```

Disponible en: `http://localhost:5000`
Swagger UI: `http://localhost:5000/apidocs`

---

## 🗄️ Modelo de Base de Datos

```
pacientes
  └─── historiales_medicos (1:1)
          ├─── consultas (1:N)
          │       └─── prescripciones_medicamentos (N:1) ── medicamentos
          └─── signos_vitales (1:N)
```

### Tablas

| Tabla                        | Descripción                                              |
|------------------------------|----------------------------------------------------------|
| `pacientes`                  | Datos demográficos y de contacto del paciente            |
| `historiales_medicos`        | Ficha clínica: alergias, enfermedades crónicas, hábitos  |
| `consultas`                  | Cada sesión médica (presencial o telemedicina)           |
| `medicamentos`               | Catálogo general de medicamentos                         |
| `prescripciones_medicamentos`| Medicamentos recetados en cada consulta                  |
| `signos_vitales`             | Mediciones del traje automatizado (FC, T°, SpO₂, etc.)  |

---

## 🔌 Endpoints de la API

### 🔑 Autenticación
| Método | Endpoint         | Descripción          |
|--------|------------------|----------------------|
| POST   | `/api/auth/login`| Obtener token JWT    |

**Body:**
```json
{ "correo": "medico@demo.com", "password": "medico123" }
```

---

### 👤 Pacientes `/api/pacientes`
| Método | Endpoint                  | Descripción                        |
|--------|---------------------------|------------------------------------|
| GET    | `/`                       | Listar pacientes (paginado, buscar)|
| POST   | `/`                       | Crear paciente + historial vacío   |
| GET    | `/<id>`                   | Obtener paciente por ID            |
| PUT    | `/<id>`                   | Actualizar datos del paciente      |
| DELETE | `/<id>`                   | Desactivar paciente (soft delete)  |

---

### 📋 Historial Médico `/api/historiales`
| Método | Endpoint                          | Descripción                     |
|--------|-----------------------------------|---------------------------------|
| GET    | `/paciente/<paciente_id>`         | Ver historial clínico           |
| PUT    | `/paciente/<paciente_id>`         | Actualizar ficha clínica        |
| GET    | `/<historial_id>/resumen`         | Resumen integrado del paciente  |

---

### 🩺 Consultas `/api/consultas`
| Método | Endpoint                              | Descripción                    |
|--------|---------------------------------------|--------------------------------|
| GET    | `/historial/<historial_id>`           | Listar consultas del paciente  |
| POST   | `/`                                   | Registrar nueva consulta       |
| GET    | `/<id>`                               | Ver consulta + prescripciones  |
| PUT    | `/<id>`                               | Actualizar consulta            |
| POST   | `/<id>/prescripciones`                | Añadir medicamento recetado    |

---

### 💊 Medicamentos `/api/medicamentos`
| Método | Endpoint  | Descripción              |
|--------|-----------|--------------------------|
| GET    | `/`       | Listar catálogo (buscar) |
| POST   | `/`       | Agregar medicamento      |
| GET    | `/<id>`   | Ver medicamento          |
| DELETE | `/<id>`   | Desactivar medicamento   |

---

### 🫀 Signos Vitales `/api/signos-vitales`
| Método | Endpoint                              | Descripción                          |
|--------|---------------------------------------|--------------------------------------|
| POST   | `/`                                   | Registrar medición (traje/manual)    |
| GET    | `/historial/<historial_id>`           | Historial de mediciones (paginado)   |
| GET    | `/historial/<historial_id>/ultimo`    | Último registro del paciente         |
| GET    | `/<id>`                               | Obtener medición por ID              |

**Campos medidos por el traje automatizado:**
- `frecuencia_cardiaca` (bpm)
- `presion_sistolica` / `presion_diastolica` (mmHg)
- `temperatura` (°C)
- `saturacion_oxigeno` (% SpO₂)
- `frecuencia_respiratoria` (resp/min)
- `glucosa` (mg/dL)
- `peso` (kg) / `altura` (m) → **IMC calculado automáticamente**

---

## 🔒 Autenticación JWT

Todos los endpoints (excepto `/api/auth/login`) requieren el header:

```
Authorization: Bearer <token>
```

---

## 🧪 Ejecutar tests

```bash
pytest tests/ -v
```

---

## 🔗 Integración con otros módulos del equipo

Este módulo expone su API en `/api/*` y puede integrarse con:

| Módulo externo       | Campo de integración                              |
|----------------------|---------------------------------------------------|
| Módulo de Médicos    | `medico_id` en Consultas                          |
| Módulo de Citas      | `proxima_cita` en Consultas                       |
| Módulo de Traje      | `POST /api/signos-vitales/` (fuente automática)   |
| Módulo de Usuarios   | Reemplazar demo auth en `auth_routes.py`          |
