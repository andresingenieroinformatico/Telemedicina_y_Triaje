# Telemedicina y Triaje — Microservicios

Este repositorio está organizado como proyecto de microservicios con tres servicios independientes y una capa de frontend.

## Estructura propuesta

```text
TELEMEDICINA_Y_TRIAJE/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
└── microservices/
    ├── agendamiento/
    │   ├── app/
    │   ├── config/
    │   ├── migrations/
    │   └── tests/
    ├── triage/
    │   ├── app.py
    │   └── triage/
    └── usuarios/
        ├── app.py
        ├── config.py
        ├── models.py
        └── routes.py
```

## Organización recomendada

- `frontend/` — interfaz de usuario que consume los microservicios.
  - `src/components/` — componentes reutilizables.
  - `src/pages/` — vistas principales.
  - `src/services/` — clientes HTTP para cada microservicio.
  - `src/styles/` — estilos globales.
- `microservices/agendamiento/` — lógica para citas y disponibilidad.
- `microservices/triage/` — lógica de evaluación y clasificación de riesgo.
- `microservices/usuarios/` — autenticación y gestión de usuarios.

## Comunicación entre servicios

- El frontend consume los microservicios mediante APIs REST.
- Cada microservicio debe exponer su propio endpoint y manejar su base de datos independiente.
- La comunicación entre servicios se realizará por HTTP para esta fase inicial.

Cada carpeta contiene su propia aplicación, dependencias y documentación.
