# 🏥 MedTrack – API Historial Médico (Dockerizado)

API REST Flask conectada a PostgreSQL, lista para correr en contenedor Docker.

---

## ⚡ Inicio rápido con Docker

### 1. Copia el archivo `.env.example` a `.env` y ajusta tus datos

```bash
cp .env.example .env
```

Edita `.env`:
```env
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=historial_medico_db
SECRET_KEY=una_clave_secreta
JWT_SECRET_KEY=otra_clave_jwt
```

### 2. Coloca el archivo SQL en la raíz del proyecto

```
medtrack/
  ├── bd-historial-medico.sql   ← aquí
  ├── docker-compose.yml
  └── ...
```

### 3. Levantar todo con Docker Compose

```bash
docker-compose up --build
```

Esto:
- Levanta PostgreSQL y crea la base de datos automáticamente
- Aplica el esquema SQL (tablas, índices, constraints)
- Levanta la API Flask en el puerto 5000

### 4. Abrir Swagger UI

```
http://localhost:5000/apidocs
```

---

## 🔌 Endpoints disponibles

| Grupo | Endpoints |
|---|---|
| **Auth** | POST `/api/auth/registro` · POST `/api/auth/login` |
| **Usuarios** | GET `/api/usuarios/` · GET `/api/usuarios/<id>` |
| **Pacientes** | GET/POST `/api/pacientes/` · GET/PUT `/<id>` · GET `/<id>/historial` |
| **Médicos** | GET/POST `/api/medicos/` · GET `/<id>` |
| **Historial** | POST `/api/historial/` · GET/PUT/DELETE `/<id>` |
| **Recetas** | POST `/api/recetas/` · GET `/historial/<id>` · DELETE `/<id>` |
| **Citas** | POST `/api/citas/` · GET `/paciente/<id>` · GET `/medico/<id>` · PUT/DELETE `/<id>` |

---

## 🔑 Flujo de uso

```bash
# 1. Registrar usuario
POST /api/auth/registro
{ "nombre": "Dr. Juan", "correo": "juan@demo.com", "contrasena": "123456", "rol": "medico" }

# 2. Login → obtener token
POST /api/auth/login
{ "correo": "juan@demo.com", "contrasena": "123456" }

# 3. Usar el token en todos los demás endpoints
Header: Authorization: Bearer <token>
```

---

## 🛠️ Sin Docker (local)

```bash
python -m venv venv
source venv/bin/activate      # Linux/Mac
venv\Scripts\activate          # Windows

pip install -r requirements.txt

flask db init
flask db migrate -m "inicial"
flask db upgrade

flask run
```

---

## 🗄️ Tablas de la base de datos

```
usuarios
  ├── pacientes  (1:N)
  │     ├── historial_medico  (1:N)
  │     │     └── recetas     (1:N)
  │     └── citas             (1:N)
  └── medicos    (1:N)
        ├── historial_medico  (1:N)
        └── citas             (1:N)
```
