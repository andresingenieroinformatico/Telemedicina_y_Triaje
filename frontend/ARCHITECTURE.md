# Arquitectura y Guía de Extensión - Frontend

## Estructura General

```
frontend/
├── public/                  # Archivos estáticos
├── src/
│   ├── components/         # Componentes reutilizables
│   ├── context/           # Contextos globales (Auth, Theme, etc)
│   ├── hooks/             # Hooks personalizados (futuro)
│   ├── pages/             # Páginas de la aplicación
│   ├── services/          # Servicios HTTP
│   ├── utils/             # Utilidades (futuro)
│   ├── App.jsx
│   ├── App.css
│   └── index.js
└── package.json
```

## Patrones Utilizados

### 1. Service Pattern
Cada microservicio tiene un servicio dedicado que encapsula todas las llamadas HTTP:

```javascript
// servicios/paciente.service.js
class PacienteService {
    async listar(filtros) { }
    async crear(datos) { }
    async obtener(id) { }
    async actualizar(id, datos) { }
}
```

**Ventajas:**
- Centralización de lógica HTTP
- Fácil de testear
- Reutilizable en múltiples componentes
- Cambios en API en un solo lugar

### 2. Context API Pattern
Para estado global (autenticación):

```javascript
// context/AuthContext.jsx
const AuthContext = createContext();
export const AuthProvider = ({ children }) => { }
export const useAuth = () => { }
```

**Ventajas:**
- No requiere Redux
- Integrado en React
- Fácil para principiantes
- Suficiente para aplicaciones medianas

### 3. Component Composition
Componentes pequeños y reutilizables:

```javascript
// UIComponents.jsx
export const Alert = ({ type, message }) => { }
export const Button = ({ children, variant }) => { }
export const Input = ({ label, error }) => { }
```

**Ventajas:**
- DRY (Don't Repeat Yourself)
- Consistencia visual
- Fácil mantenimiento
- Reutilizable

### 4. Protected Routes Pattern
Proteger rutas que requieren autenticación:

```javascript
<ProtectedRoute>
    <MiPaginaPrivada />
</ProtectedRoute>
```

## Cómo Agregar Nueva Funcionalidad

### Paso 1: Crear el Servicio

```javascript
// src/services/nueva-funcionalidad.service.js
import axios from 'axios';
import { API_BASE_URLS } from './api.config';

class NuevaFuncionalidadService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.AGENDAMIENTO,
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.Authorization = `Bearer ${token}`;
        }
    }

    async listar() {
        const response = await this.client.get('/api/v1/nueva-endpoint');
        return response.data;
    }

    async crear(datos) {
        const response = await this.client.post('/api/v1/nueva-endpoint', datos);
        return response.data;
    }
}

export default new NuevaFuncionalidadService();
```

### Paso 2: Actualizar AuthContext
Agregar el servicio al AuthContext para que use el token:

```javascript
// en AuthContext.jsx, en setAuthToken()
import NuevaFuncionalidadService from '../services/nueva-funcionalidad.service';

const setAuthToken = (token) => {
    // ... otros servicios ...
    NuevaFuncionalidadService.setAuthToken(token);
};
```

### Paso 3: Crear la Página

```javascript
// src/pages/NuevaFuncionalidadPage.jsx
import React, { useState, useEffect } from 'react';
import NuevaFuncionalidadService from '../services/nueva-funcionalidad.service';
import { Alert, Button, Input, Table } from '../components/UIComponents';

const NuevaFuncionalidadPage = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarItems();
    }, []);

    const cargarItems = async () => {
        setLoading(true);
        try {
            const data = await NuevaFuncionalidadService.listar();
            setItems(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {error && <Alert type="error" message={error} />}
            {loading ? <Spinner /> : <Table columns={[...]} data={items} />}
        </div>
    );
};

export default NuevaFuncionalidadPage;
```

### Paso 4: Agregar la Ruta

```javascript
// en App.jsx
import NuevaFuncionalidadPage from './pages/NuevaFuncionalidadPage';

<Route
    path="/nueva-funcionalidad"
    element={
        <ProtectedRoute>
            <NuevaFuncionalidadPage />
        </ProtectedRoute>
    }
/>
```

### Paso 5: Actualizar Navegación

```javascript
// en Navigation component
<Link to="/nueva-funcionalidad" style={{ color: 'white' }}>
    Nueva Funcionalidad
</Link>
```

## Mejores Prácticas

### 1. Manejo de Errores
Siempre manejar errores en servicios:

```javascript
async listar() {
    try {
        const response = await this.client.get('/api/v1/items');
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
}
```

### 2. Validación en Cliente
Validar datos antes de enviar:

```javascript
const validateForm = () => {
    const errors = {};
    if (!email.includes('@')) errors.email = 'Email inválido';
    return Object.keys(errors).length === 0;
};
```

### 3. Estados de Carga
Mostrar spinner mientras se cargan datos:

```javascript
{loading ? <Spinner /> : <Content />}
```

### 4. Localización de Variables de Entorno
Usar `.env.local` para variables sensibles:

```
REACT_APP_API_URL=http://localhost:5000
```

### 5. Comentarios JSDoc
Documentar componentes complejos:

```javascript
/**
 * Componente de lista de pacientes
 * @param {Array} pacientes - Array de pacientes
 * @param {Function} onSelect - Callback cuando se selecciona un paciente
 */
const ListaPacientes = ({ pacientes, onSelect }) => { }
```

## Performance Optimization

### 1. Lazy Loading
```javascript
import { lazy, Suspense } from 'react';

const NuevaFuncionalidadPage = lazy(() =>
    import('./pages/NuevaFuncionalidadPage')
);

<Suspense fallback={<Spinner />}>
    <NuevaFuncionalidadPage />
</Suspense>
```

### 2. Memoization
```javascript
import { useMemo } from 'react';

const pacientesFiltratos = useMemo(() => {
    return pacientes.filter(p => p.estado === estado);
}, [pacientes, estado]);
```

### 3. useCallback
```javascript
import { useCallback } from 'react';

const handleClick = useCallback(() => {
    // ...
}, [dependencias]);
```

## Testing

### Estructura de tests
```
src/
├── components/
│   ├── Button.jsx
│   └── Button.test.jsx
├── services/
│   ├── auth.service.js
│   └── auth.service.test.js
```

### Ejemplo de test
```javascript
// src/components/Button.test.jsx
import { render, screen } from '@testing-library/react';
import { Button } from './UIComponents';

test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

## State Management

Opciones según escala:
- **Pequeño**: Context API (actual)
- **Mediano**: Zustand o Jotai
- **Grande**: Redux o MobX

## Recomendaciones Finales

1. **Mantener componentes pequeños** - Máximo 300 líneas
2. **Un responsabilidad por componente** - Single Responsibility Principle
3. **Reutilizar componentes** - Evitar duplicación
4. **Documentar código** - Especialmente lógica compleja
5. **Testear crítico** - Auth, servicios principales
6. **Performance** - Monitorear en DevTools
7. **Accesibilidad** - Usar semantic HTML
8. **Mobile first** - Responsive desde el inicio
9. **SEO** - Si es necesario, usar Next.js
10. **Monitoreo** - Implementar error tracking (Sentry, etc)

## Recursos

- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)
- [React Testing Library](https://testing-library.com/react)
- [Best Practices](https://dmitripavlutin.com/react-best-practices/)
