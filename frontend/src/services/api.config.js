/**
 * Configuración de variables de entorno para conexión a microservicios
 */
export const API_BASE_URLS = {
    AGENDAMIENTO: process.env.REACT_APP_AGENDAMIENTO_URL || 'http://localhost:5000',
    TRIAGE: process.env.REACT_APP_TRIAGE_URL || 'http://localhost:5001',
    USUARIOS: process.env.REACT_APP_USUARIOS_URL || 'http://localhost:5002',
    HISTORIAL_MEDICO: process.env.REACT_APP_HISTORIAL_MEDICO_URL || 'http://localhost:5003',
};

export const API_ENDPOINTS = {
    // Agendamiento Service
    AGENDAMIENTOS: {
        LIST: '/api/v1/agendamientos',
        CREATE: '/api/v1/agendamientos',
        DETAIL: (id) => `/api/v1/agendamientos/${id}`,
        UPDATE_ESTADO: (id) => `/api/v1/agendamientos/${id}/estado`,
        CANCEL: (id) => `/api/v1/agendamientos/${id}`,
        HISTORIAL: (id) => `/api/v1/agendamientos/${id}/historial`,
        SLOTS: '/api/v1/agendamientos/slots',
        SEARCH_CODIGO: (codigo) => `/api/v1/agendamientos/codigo/${codigo}`,
    },
    MEDICOS: {
        LIST: '/api/v1/medicos',
        CREATE: '/api/v1/medicos',
        DETAIL: (id) => `/api/v1/medicos/${id}`,
        UPDATE: (id) => `/api/v1/medicos/${id}`,
    },
    PACIENTES: {
        LIST: '/api/v1/pacientes',
        CREATE: '/api/v1/pacientes',
        DETAIL: (id) => `/api/v1/pacientes/${id}`,
        UPDATE: (id) => `/api/v1/pacientes/${id}`,
        SEARCH_DOC: (numero) => `/api/v1/pacientes/documento/${numero}`,
    },
    ESPECIALIDADES: {
        LIST: '/api/v1/especialidades',
        CREATE: '/api/v1/especialidades',
        DETAIL: (id) => `/api/v1/especialidades/${id}`,
        UPDATE: (id) => `/api/v1/especialidades/${id}`,
    },
    DISPONIBILIDAD: {
        GET_MEDICO: (medico_id) => `/api/v1/disponibilidad/medico/${medico_id}`,
        CREATE: '/api/v1/disponibilidad',
        DELETE: (id) => `/api/v1/disponibilidad/${id}`,
    },
    AUTH: {
        LOGIN: '/api/v1/auth/login',
        LOGIN_COOKIE: '/api/v1/auth/login_cookie',
        LOGOUT: '/api/v1/auth/logout',
    },
    HEALTH: '/api/v1/health',

    // Triage Service
    TRIAGE: {
        EVALUAR: '/triage',
        HISTORIAL: (id_paciente) => `/triage/${id_paciente}`,
    },

    // Usuarios Service
    USUARIOS: {
        CREAR: '/usuarios',
        OBTENER: (id) => `/usuarios/${id}`,
        LISTAR: '/usuarios',
    },

    // Historial Médico Service
    HISTORIAL_MEDICO: {
        PACIENTES: '/api/pacientes/',
        PACIENTE: (id) => `/api/pacientes/${id}`,
        RESUMEN: (id) => `/api/historiales/paciente/${id}`,
        CONSULTAS: (historialId) => `/api/consultas/historial/${historialId}`,
        MEDICAMENTOS: '/api/medicamentos/',
    },
};
