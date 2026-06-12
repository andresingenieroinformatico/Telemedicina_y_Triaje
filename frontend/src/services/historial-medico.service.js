import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el microservicio de Historial Médico
 */
class HistorialMedicoService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.HISTORIAL_MEDICO,
            withCredentials: true,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.client.defaults.headers.Authorization;
        }
    }

    async listarPacientes() {
        const response = await this.client.get(API_ENDPOINTS.HISTORIAL_MEDICO.PACIENTES);
        return response.data;
    }

    async obtenerPaciente(id) {
        const response = await this.client.get(API_ENDPOINTS.HISTORIAL_MEDICO.PACIENTE(id));
        return response.data;
    }

    async obtenerResumenPaciente(id) {
        const response = await this.client.get(API_ENDPOINTS.HISTORIAL_MEDICO.RESUMEN(id));
        return response.data;
    }

    async listarConsultas(historialId) {
        const response = await this.client.get(API_ENDPOINTS.HISTORIAL_MEDICO.CONSULTAS(historialId));
        return response.data;
    }

    async listarMedicamentos() {
        const response = await this.client.get(API_ENDPOINTS.HISTORIAL_MEDICO.MEDICAMENTOS);
        return response.data;
    }
}

const historialMedicoService = new HistorialMedicoService();
export default historialMedicoService;
