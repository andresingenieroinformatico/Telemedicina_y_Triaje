# 🏥 Telemedicina API — Módulo de Agendamientos

API REST para la plataforma de **Telemedicina y Triaje Automatizado**.  
Desarrollada con **Flask + SQLAlchemy**, metodología **Scrum**.

---

## � Estrategias de Autenticación

La API soporta dos métodos de autenticación para facilitar la integración con diferentes interfaces:

### 1. Header Authorization (Recomendado para APIs y Apps Móviles)
- **Endpoint**: `/api/v1/auth/login`
- **Uso**: El cliente recibe el `access_token` en el JSON y debe enviarlo en el header:  
  `Authorization: Bearer <TOKEN>`

### 2. HTTP-Only Cookies (Recomendado para Web/SPA)
- **Endpoint**: `/api/v1/auth/login_cookie`
- **Uso**: El servidor gestiona la cookie `access_token_cookie`.
- **Configuración Frontend**: Es necesario configurar el cliente (Axios/Fetch) para incluir credenciales:
  - **Axios**: `axios.defaults.withCredentials = true;`
  - **Fetch**: `fetch(url, { credentials: 'include' });`
- **Seguridad**: En producción, las cookies tienen activas las banderas `Secure`, `HttpOnly` y `SameSite=Lax`.

---

## �📋 Información del Proyecto

| Campo            | Detalle                                  |
|------------------|------------------------------------------|
| Sprint activo    | Sprint 1                                 |
| Fechas           | 22-05-2026 → 05-06-2026                  |
| Metodología      | Scrum                                    |
| Tecnología       | Python · Flask · PostgreSQL / SQLite · SQLAlchemy |
| Grupo            | Darwin, Juan, Juantin                    |

---

## 🚀 Configuración e Instalación

### 1. Clonar y preparar el entorno

```bash
git clone <repositorio>
cd telemedicina_api
python -m venv .venv
# Linux / Mac
source .venv/bin/activate
# Windows
.venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Variables de entorno

```bash
cp .env.example .env
```

Edita `.env` según tu entorno. Para PostgreSQL local con Docker, el valor por defecto ya funciona.

### 3. Configurar Flask

Windows PowerShell:

```powershell
setx FLASK_APP "run.py"
setx FLASK_ENV "development"
```

Linux / macOS:

```bash
export FLASK_APP=run.py
export FLASK_ENV=development
```

### 4. Crear la base de datos y aplicar migraciones

```bash
flask db upgrade
```

### 5. Ejecutar servidor

```bash
python run.py
```

Servidor disponible en: `http://localhost:5000`

### 6. Ejecutar con Docker

```bash
docker compose up --build
```

El contenedor construye la imagen, aplica las migraciones y arranca la API en `http://localhost:5000`.

Para detenerlo:

```bash
docker compose down
```

---

## 📡 Endpoints

### Health Check

| Método | Ruta              | Descripción          |
|--------|-------------------|----------------------|
| GET    | `/api/v1/health`  | Estado del servicio  |

---

### 📅 Agendamientos  `/api/v1/agendamientos`

| Método | Ruta                                  | Descripción                        |
|--------|---------------------------------------|------------------------------------|
| GET    | `/api/v1/agendamientos`               | Listar con filtros y paginación    |
| POST   | `/api/v1/agendamientos`               | Crear nuevo agendamiento           |
| GET    | `/api/v1/agendamientos/<id>`          | Detalle de un agendamiento         |
| PATCH  | `/api/v1/agendamientos/<id>/estado`   | Cambiar estado                     |
| DELETE | `/api/v1/agendamientos/<id>`          | Cancelar (soft delete)             |
| GET    | `/api/v1/agendamientos/<id>/historial`| Historial de cambios               |
| GET    | `/api/v1/agendamientos/slots`         | Slots disponibles de un médico     |
| GET    | `/api/v1/agendamientos/codigo/<cod>`  | Buscar por código TM-XXXXXXXX      |

#### Filtros disponibles en GET /agendamientos

```
?paciente_id=1&medico_id=2&estado=PENDIENTE
?fecha_inicio=2026-06-01&fecha_fin=2026-06-30
?nivel_triaje=ROJO&modalidad=VIDEOCONSULTA
?page=1&per_page=20
```

#### POST /agendamientos — Crear cita

```json
{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_cita": "2026-06-02",
  "hora_inicio": "09:00",
  "tipo_consulta": "PRIMERA_VEZ",
  "modalidad": "VIDEOCONSULTA",
  "motivo_consulta": "Dolor de cabeza frecuente",
  "nivel_triaje": "AMARILLO",
  "puntaje_triaje": 45
}
```

#### PATCH /agendamientos/<id>/estado — Cambiar estado

```json
{
  "estado": "CONFIRMADA",
  "observacion": "Confirmada por teléfono",
  "modificado_por": "recepcionista@clinica.co"
}
```

```json
{
  "estado": "CANCELADA",
  "motivo_cancelacion": "Paciente viajó fuera de la ciudad",
  "modificado_por": "paciente"
}
```

#### GET /agendamientos/slots — Slots disponibles

```
GET /api/v1/agendamientos/slots?medico_id=1&fecha=2026-06-02
```

Respuesta:
```json
{
  "data": {
    "medico_id": 1,
    "fecha": "2026-06-02",
    "total_slots": 16,
    "slots_disponibles": 15,
    "slots_ocupados": 1,
    "slots": [
      { "hora_inicio": "08:00", "hora_fin": "08:30", "disponible": true },
      { "hora_inicio": "08:30", "hora_fin": "09:00", "disponible": false }
    ]
  }
}
```

---

### 👨‍⚕️ Médicos  `/api/v1/medicos`

| Método | Ruta                           | Descripción            |
|--------|--------------------------------|------------------------|
| GET    | `/api/v1/medicos`              | Listar médicos activos |
| POST   | `/api/v1/medicos`              | Registrar médico       |
| GET    | `/api/v1/medicos/<id>`         | Detalle               |
| PUT    | `/api/v1/medicos/<id>`         | Actualizar datos       |

---

### 🧑‍🤝‍🧑 Pacientes  `/api/v1/pacientes`

| Método | Ruta                                       | Descripción           |
|--------|--------------------------------------------|-----------------------|
| GET    | `/api/v1/pacientes`                        | Listar pacientes      |
| POST   | `/api/v1/pacientes`                        | Registrar paciente    |
| GET    | `/api/v1/pacientes/<id>`                   | Detalle               |
| PUT    | `/api/v1/pacientes/<id>`                   | Actualizar datos      |
| GET    | `/api/v1/pacientes/documento/<numero>`     | Buscar por documento  |

---

### 🏥 Especialidades  `/api/v1/especialidades`

| Método | Ruta                              | Descripción            |
|--------|-----------------------------------|------------------------|
| GET    | `/api/v1/especialidades`          | Listar especialidades  |
| POST   | `/api/v1/especialidades`          | Crear especialidad     |
| GET    | `/api/v1/especialidades/<id>`     | Detalle                |
| PUT    | `/api/v1/especialidades/<id>`     | Actualizar             |

---

### 📆 Disponibilidad  `/api/v1/disponibilidad`

| Método | Ruta                                        | Descripción                      |
|--------|---------------------------------------------|----------------------------------|
| GET    | `/api/v1/disponibilidad/medico/<medico_id>` | Ver disponibilidad de un médico  |
| POST   | `/api/v1/disponibilidad`                    | Agregar bloque de disponibilidad |
| DELETE | `/api/v1/disponibilidad/<id>`               | Desactivar bloque                |

---

## 🔄 Estados de Agendamiento

```
PENDIENTE ──► CONFIRMADA ──► EN_CURSO ──► COMPLETADA
    │              │
    └──────────────┴──► CANCELADA
                   │
                   └──► NO_ASISTIO
```

---

## 🗄️ Modelo de Datos

```
especialidades ──< medicos ──< disponibilidad_medico
                      │
                      └──< agendamientos >── pacientes
                                 │
                                 └──< historial_agendamientos
```

---

## 🔗 Integración con Triaje Automatizado

El campo `nivel_triaje` acepta: `VERDE | AMARILLO | NARANJA | ROJO`  
El campo `puntaje_triaje` acepta: 0-100

El módulo de triaje externo puede actualizar estos campos via PATCH al crear o actualizar el agendamiento.

---

## 🧪 Prueba Rápida

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Crear paciente
curl -X POST http://localhost:5000/api/v1/pacientes \
  -H "Content-Type: application/json" \
  -d '{"numero_documento":"12345678","tipo_documento":"CC","nombres":"Prueba","apellidos":"Usuario","fecha_nacimiento":"1990-01-01","genero":"M","email":"prueba@test.com","telefono":"3001234567"}'

# Ver slots disponibles
curl "http://localhost:5000/api/v1/agendamientos/slots?medico_id=1&fecha=2026-06-02"

# Crear agendamiento
curl -X POST http://localhost:5000/api/v1/agendamientos \
  -H "Content-Type: application/json" \
  -d '{"paciente_id":1,"medico_id":1,"fecha_cita":"2026-06-02","hora_inicio":"08:00","motivo_consulta":"Consulta de prueba"}'
```
