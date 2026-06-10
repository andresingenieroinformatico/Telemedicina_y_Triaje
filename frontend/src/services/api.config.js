const BASE_URL = 'http://localhost';

export const API_BASE_URLS = {
    AGENDAMIENTO: `${BASE_URL}:5000/api/v1`,
    TRIAGE: `${BASE_URL}:5001/api/v1`,
    USUARIOS: `${BASE_URL}:5002`, // Nota: Usuarios suele no tener /api/v1 en tus rutas
    HISTORIAL_MEDICO: `${BASE_URL}:5003/api/v1`,
    VIDEOCONFERENCIA: `${BASE_URL}:5004/api/v1`,
};

export const API_ENDPOINTS = {
    HISTORIAL_MEDICO: {
        PACIENTES: '/pacientes',
        PACIENTE: (id) => `/pacientes/${id}`,
        RESUMEN: (id) => `/pacientes/${id}/resumen`,
        CONSULTAS: (id) => `/historial/${id}/consultas`,
    }
};
