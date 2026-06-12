# 🏥 Telemedicina API - Guía Completa

API REST para plataforma de **Telemedicina y Triaje Automatizado**.  
**Framework**: Flask + SQLAlchemy + PostgreSQL/SQLite  
**Autenticación**: JWT (JSON Web Tokens)  
**Status**: ✅ Funcional - En Desarrollo

---

## 📋 Tabla de Contenidos

- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Autenticación](#autenticación)
- [Endpoints](#endpoints)
- [Ejemplos de Uso](#ejemplos-de-uso)
- [Estructura del Proyecto](#estructura-del-proyecto)

---

## 🚀 Instalación

### Requisitos
- Python 3.9+
- PostgreSQL 12+ (recomendado para producción)
- SQLite (incluido para desarrollo)

### Pasos

```bash
# 1. Clonar repositorio
git clone <repositorio>
cd telemedicina_api/telemedicina_api

# 2. Crear ambiente virtual
python -m venv venv

# Activar (Linux/Mac)
source venv/bin/activate

# Activar (Windows)
venv\Scripts\activate

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env según tu configuración
```

---

## ⚙️ Configuración

### Variables de Entorno (.env)

```bash
# Flask
FLASK_APP=run.py
FLASK_ENV=development  # o production
FLASK_DEBUG=True

# Base de Datos
DATABASE_URL=sqlite:///telemedicina_dev.db
# Para PostgreSQL: postgresql://usuario:password@localhost:5432/telemedicina_db

# JWT
JWT_SECRET_KEY=tu_clave_jwt_muy_segura_aqui
JWT_ACCESS_TOKEN_EXPIRES=3600  # 1 hora

# Aplicación
SECRET_KEY=tu_clave_secreta_muy_segura_aqui
APP_PORT=5000
APP_HOST=0.0.0.0
```

### Base de Datos

#### Primera vez (crear tablas)
```bash
flask db init          # Inicializar Alembic (solo primera vez)
flask db migrate -m "Descripción"  # Crear migración
flask db upgrade       # Aplicar migración
python seed.py         # Poblar datos de prueba
```

#### Crear usuarios
```bash
python create_users.py
```

---

## ▶️ Ejecución

### Modo Desarrollo
```bash
python run.py
# o
flask run
```

Servidor disponible en: `http://localhost:5000`

### Modo Producción
```bash
# Usar gunicorn (instalar: pip install gunicorn)
gunicorn -w 4 -b 0.0.0.0:5000 run:app
```

---

## 🔐 Autenticación

### Sistema JWT

Todos los endpoints (excepto login, register, health) requieren token JWT en header:

```bash
Authorization: Bearer <tu_token_aqui>
```

### Registro

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "nuevousuario",
  "email": "usuario@example.com",
  "password": "password123456"  # Mínimo 8 caracteres
}
```

**Respuesta** (201):
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente.",
  "data": {
    "id": 1,
    "username": "nuevousuario",
    "email": "usuario@example.com",
    "rol": "PACIENTE"
  }
}
```

### Login

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123456"
}
```

**Respuesta** (200):
```json
{
  "success": true,
  "message": "Autenticación exitosa.",
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": 1,
      "username": "admin",
      "email": "admin@telemedicina.co",
      "rol": "ADMIN"
    }
  }
}
```

### Obtener Información del Usuario Autenticado

```bash
GET /api/v1/auth/me
Authorization: Bearer <token>
```

---

## 📡 Endpoints

### Health Check
```bash
GET /api/v1/health
```

Verificar estado del servicio.

### Especialidades

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/especialidades` | Listar todas |
| POST | `/especialidades` | Crear nueva |
| GET | `/especialidades/<id>` | Obtener detalle |
| PUT | `/especialidades/<id>` | Actualizar |

### Médicos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/medicos` | Listar (con filtro opcional: `?especialidad_id=1`) |
| POST | `/medicos` | Crear nuevo |
| GET | `/medicos/<id>` | Obtener detalle |
| PUT | `/medicos/<id>` | Actualizar |

### Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/pacientes` | Listar |
| POST | `/pacientes` | Crear nuevo |
| GET | `/pacientes/<id>` | Obtener detalle |
| GET | `/pacientes/documento/<numero>` | Buscar por documento |
| PUT | `/pacientes/<id>` | Actualizar |

### Disponibilidad Médica

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/disponibilidad/medico/<medico_id>` | Horarios de un médico |
| POST | `/disponibilidad` | Crear horario |
| DELETE | `/disponibilidad/<id>` | Desactivar horario |

### Agendamientos (Citas)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/agendamientos` | Listar con filtros y paginación |
| POST | `/agendamientos` | Crear nuevo |
| GET | `/agendamientos/<id>` | Obtener detalle |
| PATCH | `/agendamientos/<id>/estado` | Cambiar estado |
| DELETE | `/agendamientos/<id>` | Cancelar |
| GET | `/agendamientos/<id>/historial` | Ver historial de cambios |
| GET | `/agendamientos/slots?medico_id=1&fecha=2026-06-01` | Slots disponibles |
| GET | `/agendamientos/codigo/<codigo>` | Buscar por código TM-XXXXX |

---

## 💡 Ejemplos de Uso

### 1. Crear Paciente

```bash
POST /api/v1/pacientes
Authorization: Bearer <token>
Content-Type: application/json

{
  "numero_documento": "12345678",
  "tipo_documento": "CC",
  "nombres": "Juan",
  "apellidos": "Pérez García",
  "fecha_nacimiento": "1990-05-15",
  "genero": "M",
  "email": "juan@example.com",
  "telefono": "3001234567",
  "ciudad": "Bogotá"
}
```

### 2. Crear Disponibilidad (Médico)

```bash
POST /api/v1/disponibilidad
Authorization: Bearer <token>
Content-Type: application/json

{
  "medico_id": 1,
  "dia_semana": "LUNES",
  "hora_inicio": "09:00",
  "hora_fin": "17:00"
}
```

### 3. Crear Agendamiento (Cita)

```bash
POST /api/v1/agendamientos
Authorization: Bearer <token>
Content-Type: application/json

{
  "paciente_id": 1,
  "medico_id": 1,
  "fecha_cita": "2026-06-01",
  "hora_inicio": "10:00",
  "tipo_consulta": "PRIMERA_VEZ",
  "modalidad": "VIDEOCONSULTA",
  "motivo_consulta": "Consulta por dolor de cabeza"
}
```

### 4. Cambiar Estado de Agendamiento

```bash
PATCH /api/v1/agendamientos/1/estado
Authorization: Bearer <token>
Content-Type: application/json

{
  "estado": "CONFIRMADA",
  "observacion": "Cita confirmada por el médico"
}
```

Para cancelar:
```json
{
  "estado": "CANCELADA",
  "motivo_cancelacion": "Paciente solicita cancelación"
}
```

### 5. Obtener Slots Disponibles

```bash
GET /api/v1/agendamientos/slots?medico_id=1&fecha=2026-06-01
Authorization: Bearer <token>
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "medico_id": 1,
    "fecha": "2026-06-01",
    "total_slots": 8,
    "slots_disponibles": 5,
    "slots_ocupados": 3,
    "slots": [
      {
        "hora_inicio": "09:00",
        "hora_fin": "09:30",
        "disponible": true
      },
      ...
    ]
  }
}
```

---

## 📁 Estructura del Proyecto

```
telemedicina_api/
├── app/
│   ├── __init__.py           # Factory Flask
│   ├── models/               # Modelos SQLAlchemy
│   │   ├── paciente.py
│   │   ├── medico.py
│   │   ├── especialidad.py
│   │   ├── disponibilidad.py
│   │   ├── agendamiento.py
│   │   ├── historial.py
│   │   ├── usuario.py        # ✨ Nuevo: Autenticación
│   │   └── base.py           # Mixin de timestamps
│   ├── routes/               # Endpoints (Blueprints)
│   │   ├── auth_routes.py    # ✨ Nuevo: Login/Register
│   │   ├── paciente_routes.py
│   │   ├── medico_routes.py
│   │   ├── especialidad_routes.py
│   │   ├── disponibilidad_routes.py
│   │   ├── agendamiento_routes.py
│   │   └── health_routes.py
│   ├── services/             # Lógica de negocio
│   │   ├── agendamiento_service.py
│   │   └── __init__.py
│   ├── schemas/              # Validación (Marshmallow)
│   │   └── __init__.py
│   └── utils/                # Utilidades
│       ├── __init__.py       # Respuestas estándar, paginación
│       └── auth.py           # ✨ Nuevo: Decoradores JWT
├── config/
│   ├── __init__.py
│   └── config.py             # Configuración por entorno
├── migrations/               # ✨ Inicializadas: Migraciones Alembic
│   └── versions/             # Scripts de migración
├── tests/                    # Tests (vacío - listo para agregar)
├── .env                      # ✨ Nuevo: Variables de entorno
├── .env.example              # Plantilla de .env
├── requirements.txt          # Dependencias
├── run.py                    # Punto de entrada
├── seed.py                   # Datos de prueba
├── create_users.py           # ✨ Nuevo: Crear usuarios
├── test_api.py               # ✨ Nuevo: Probar endpoints
└── README.md                 # Este archivo
```

---

## 🧪 Testing

### Pruebas Automáticas

```bash
python test_api.py
```

### Pruebas Manuales con curl

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}'

# Obtener especialidades (con token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/v1/especialidades
```

### Con Postman

1. Importar colección (cuando esté disponible)
2. Configurar environment con `{{base_url}}` y `{{token}}`
3. Ejecutar requests pre-configuradas

---

## 🔒 Seguridad

### En Desarrollo
- ⚠️ Debug mode: ON
- ⚠️ Secret keys: generadas (cambiar en producción)
- ✅ CORS: Habilitado para desarrollo
- ✅ HTTPS: No requerido en desarrollo

### En Producción
- ❌ Debug mode: OFF
- ✅ Secret keys: Variables de entorno seguras
- ✅ HTTPS: Requerido
- ✅ Database: PostgreSQL
- ✅ CORS: Restringido a dominios conocidos
- ✅ Rate limiting: Implementar
- ✅ CSRF protection: Implementar

---

## 📊 Estados de Agendamiento

```
PENDIENTE → CONFIRMADA → EN_CURSO → COMPLETADA
   ↓           ↓            ↓
CANCELADA   CANCELADA   CANCELADA

   ↓
NO_ASISTIO
```

---

## 🐛 Troubleshooting

### Problema: "ModuleNotFoundError: No module named 'flask_sqlalchemy'"
**Solución**: 
```bash
pip install -r requirements.txt
```

### Problema: "Error: pg_config executable not found"
**Solución**: Usar SQLite en desarrollo o instalar PostgreSQL dev tools

### Problema: "Cannot access database"
**Solución**: 
```bash
# Recrear BD
rm telemedicina_dev.db
flask db upgrade
python seed.py
```

### Problema: "Invalid JWT token"
**Solución**: 
1. Verificar que el token no haya expirado (1 hora por defecto)
2. Volver a hacer login para obtener nuevo token

---

## 📝 Notas

- **Migraciones**: Usar `flask db migrate` antes de cambios en modelos
- **Datos de Prueba**: Ejecutar `seed.py` para poblar datos iniciales
- **Usuarios Predefinidos**: Ver `create_users.py`
- **Token Expiration**: Configurar en `.env` con `JWT_ACCESS_TOKEN_EXPIRES`

---

## 📚 Tecnologías

- **Backend**: Flask 3.0.3
- **ORM**: SQLAlchemy 2.0.30
- **Migraciones**: Alembic 1.13.1
- **Validación**: Marshmallow 3.21.3
- **Autenticación**: Flask-JWT-Extended 4.6.0
- **CORS**: Flask-CORS 4.0.1
- **Database**: PostgreSQL / SQLite
- **Password Hashing**: Werkzeug 3.0.3

---

## 🎯 Siguientes Pasos

1. ✅ Migrations inicializadas
2. ✅ Autenticación JWT implementada
3. ✅ Usuarios creados
4. ✅ Endpoints funcionando
5. 🔄 Agregar tests unitarios
6. 🔄 Integración con Videoconferencia (Jitsi/Zoom)
7. 🔄 Notificaciones por Email/SMS
8. 🔄 Documentación Swagger/OpenAPI
9. 🔄 Deploy a Producción

---

## 📞 Soporte

Para reportar bugs o sugerencias, crear un issue en el repositorio.

---

**Última actualización**: 26 de mayo de 2026  
**Versión**: 1.0.0
