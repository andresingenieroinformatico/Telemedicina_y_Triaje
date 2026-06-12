# Frontend Telemedicina

Interfaz de usuario React para la plataforma de Telemedicina y Triaje Automatizado.

## Estructura

```
frontend/
├── public/
│   └── index.html          # HTML principal
├── src/
│   ├── services/           # Clientes HTTP para microservicios
│   │   ├── api.config.js
│   │   ├── agendamiento.service.js
│   │   ├── triage.service.js
│   │   └── auth.service.js
│   ├── pages/              # Páginas principales
│   │   ├── LoginPage.jsx
│   │   ├── TriagePage.jsx
│   │   └── AgendamientoPage.jsx
│   ├── components/         # Componentes reutilizables
│   ├── App.jsx             # Componente raíz
│   ├── index.jsx           # Punto de entrada
│   ├── index.css           # Estilos globales
│   └── App.css
└── package.json
```

## Instalación

```bash
npm install
```

## Variables de entorno

Crear un archivo `.env` en la carpeta `frontend/`:

```
REACT_APP_AGENDAMIENTO_URL=http://localhost:5000
REACT_APP_TRIAGE_URL=http://localhost:5001
REACT_APP_USUARIOS_URL=http://localhost:5002
```

## Ejecución

```bash
npm start
```

La aplicación estará disponible en `http://localhost:3000`.

## Microservicios integrados

- **Agendamiento**: Gestión de citas y disponibilidad
- **Triaje**: Evaluación y clasificación de riesgo
- **Usuarios**: Autenticación

## TODO

- [ ] Integrar servicios con componentes
- [ ] Implementar contexto de autenticación global
- [ ] Agregar manejo de errores robusto
- [ ] Crear componentes reutilizables
- [ ] Agregar validación de formularios
- [ ] Implementar responsive design
- [ ] Agregar pruebas unitarias
