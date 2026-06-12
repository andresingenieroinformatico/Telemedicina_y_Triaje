export const API_BASE_URLS = {
    AGENDAMIENTO: process.env.REACT_APP_AGENDAMIENTO_URL || 'http://localhost:5000/api/v1',
    TRIAGE: process.env.REACT_APP_TRIAGE_URL || 'http://localhost:5001',
    USUARIOS: process.env.REACT_APP_USUARIOS_URL || 'http://localhost:5002/api/v1',
    HISTORIAL_MEDICO: process.env.REACT_APP_HISTORIAL_MEDICO_URL || 'http://localhost:5003/api',
    VIDEOCONFERENCIA: process.env.REACT_APP_VIDEOCONFERENCIA_URL || 'http://localhost:5004/api/v1',
};

export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        LOGIN_COOKIE: '/auth/login-cookie',
        LOGOUT: '/auth/logout',
    },
    PACIENTES: {
        LIST: '/pacientes',
        CREATE: '/pacientes',
        DETAIL: (id) => `/pacientes/${id}`,
        UPDATE: (id) => `/pacientes/${id}`,
        SEARCH_DOC: (num) => `/pacientes/buscar/${num}`,
    },
    AGENDAMIENTOS: {
        LIST: '/agendamientos',
        CREATE: '/agendamientos',
        DETAIL: (id) => `/agendamientos/${id}`,
        UPDATE_ESTADO: (id) => `/agendamientos/${id}/estado`,
        CANCEL: (id) => `/agendamientos/${id}`,
        HISTORIAL: (id) => `/agendamientos/${id}/historial`,
        SLOTS: '/agendamientos/slots',
        SEARCH_CODIGO: (codigo) => `/agendamientos/buscar/${codigo}`,
    },
    MEDICOS: {
        LIST: '/medicos',
        CREATE: '/medicos',
        DETAIL: (id) => `/medicos/${id}`,
        UPDATE: (id) => `/medicos/${id}`,
    },
    ESPECIALIDADES: {
        LIST: '/especialidades',
        CREATE: '/especialidades',
        DETAIL: (id) => `/especialidades/${id}`,
        UPDATE: (id) => `/especialidades/${id}`,
    },
    HISTORIAL_MEDICO: {
        PACIENTES: '/pacientes',
        PACIENTE: (id) => `/pacientes/${id}`,
        RESUMEN: (id) => `/pacientes/${id}/resumen`,
        CONSULTAS: (id) => `/historial/${id}/consultas`,
        MEDICAMENTOS: '/medicamentos',
    },
    TRIAGE: {
        EVALUAR: '/triage',
        HISTORIAL: (id) => `/triage/${id}`,
    },
    DISPONIBILIDAD: {
        GET_MEDICO: (id) => `/medicos/${id}/disponibilidad`,
        CREATE: '/disponibilidad',
        DELETE: (id) => `/disponibilidad/${id}`,
    },
    USUARIOS: {
        CREAR: '/pacientes',
        LISTAR: '/pacientes',
        OBTENER: (id) => `/pacientes/${id}`,
    },
};
