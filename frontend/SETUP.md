# Frontend Setup Guide - Telemedicina y Triaje

## Instalación de dependencias

```bash
npm install
```

## Variables de entorno

Copiar el archivo `.env.example` a `.env.local` y configurar las URLs de los microservicios:

```bash
cp .env.example .env.local
```

**Contenido de .env.local:**
```
REACT_APP_AGENDAMIENTO_URL=http://localhost:5000
REACT_APP_TRIAGE_URL=http://localhost:5001
REACT_APP_USUARIOS_URL=http://localhost:5002
REACT_APP_HISTORIAL_MEDICO_URL=http://localhost:5003
REACT_APP_VIDEOCONFERENCIA_URL=http://localhost:5004
```

## Ejecutar el proyecto

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## Estructura del proyecto

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── ProtectedRoute.jsx       # Rutas protegidas por autenticación
│   │   └── UIComponents.jsx          # Componentes reutilizables
│   ├── context/
│   │   └── AuthContext.jsx           # Contexto global de autenticación
│   ├── pages/
│   │   ├── LoginPage.jsx
│   │   ├── TriagePage.jsx
│   │   └── AgendamientoPage.jsx
│   ├── services/
│   │   ├── api.config.js             # Configuración de endpoints
│   │   ├── auth.service.js
│   │   ├── agendamiento.service.js
│   │   ├── triage.service.js
│   │   ├── usuario.service.js
│   │   ├── paciente.service.js
│   │   ├── medico.service.js
│   │   ├── especialidad.service.js
│   │   ├── disponibilidad.service.js
│   │   └── axios.interceptors.js    # Interceptadores globales
│   ├── App.jsx
│   └── App.css
└── package.json
```

## Funcionalidades implementadas

### 1. Autenticación
- Login con usuario y contraseña
- Token almacenado en localStorage
- Context global para manejo de autenticación
- Rutas protegidas

### 2. Triaje
- Evaluación de pacientes con síntomas y signos vitales
- Cálculo automático del nivel de triaje
- Historial de evaluaciones
- Búsqueda de pacientes

### 3. Agendamiento
- Crear nuevos agendamientos
- Listar agendamientos con filtros
- Cancelar agendamientos
- Gestión de médicos, pacientes y especialidades

### 4. Componentes reutilizables
- Input (con validación)
- Select (con opciones)
- Button (con variantes)
- Alert (info, success, error, warning)
- Table (listados dinámicos)
- Spinner (indicador de carga)
- FormGroup (contenedores)

### 5. Integración con microservicios
- Servicios para cada endpoint
- Interceptadores de Axios para manejo de errores
- Manejo de tokens de autenticación

## Flujo de autenticación

1. Usuario ingresa credenciales en LoginPage
2. Se envía solicitud al endpoint de autenticación
3. Si es exitoso, se obtiene el token y se almacena en localStorage
4. El token se agrega a todos los headers de las solicitudes
5. Si el token expira (401), se redirige al login

## Ejemplo de uso de servicios

```javascript
import AuthService from '../services/auth.service';
import AgendamientoService from '../services/agendamiento.service';

// Login
const response = await AuthService.login(username, password);

// Listar agendamientos
const agendamientos = await AgendamientoService.listar({ 
  paciente_id: 1, 
  estado: 'PENDIENTE' 
});

// Crear agendamiento
const newAgendamiento = await AgendamientoService.crear({
  paciente_id: 1,
  medico_id: 1,
  fecha_cita: '2025-01-15',
  hora_cita: '10:00'
});
```

## Ejemplo de uso del AuthContext

```javascript
import { useAuth } from '../context/AuthContext';

function MiComponente() {
  const { user, isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated && <p>Bienvenido {user?.username}</p>}
      <button onClick={() => logout()}>Cerrar sesión</button>
    </div>
  );
}
```

## Ejemplo de uso de ProtectedRoute

```javascript
import ProtectedRoute from '../components/ProtectedRoute';
import MiPagina from './MiPagina';

<Routes>
  <Route
    path="/mi-pagina"
    element={
      <ProtectedRoute>
        <MiPagina />
      </ProtectedRoute>
    }
  />
</Routes>
```

## Testing

```bash
npm test
```

## Build para producción

```bash
npm run build
```

## Troubleshooting

### CORS errors
Asegúrese de que los microservicios estén ejecutándose en los puertos correctos y que tengan CORS habilitado.

### Token inválido
Limpie el localStorage y vuelva a hacer login:
```javascript
localStorage.removeItem('auth_token');
```

### Rutas no encontradas
Verifi
que que las URLs de los microservicios estén correctas en `.env.local`.

## Mejoras futuras

- [ ] Agregar más páginas (perfil de usuario, historial médico, etc.)
- [ ] Implementar notificaciones en tiempo real
- [ ] Agregar temas personalizables
- [ ] Mejorar validaciones
- [ ] Agregar pruebas unitarias
- [ ] Implementar PWA
- [ ] Agregar internacionalización (i18n)
