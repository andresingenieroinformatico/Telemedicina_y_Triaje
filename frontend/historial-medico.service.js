import axios from 'axios';
import { API_BASE_URLS } from './api.config'; // Asume que api.config.js existe y se actualizará

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
            this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete this.client.defaults.headers.common['Authorization'];
        }
    }

    async listarPacientes() {
        const response = await this.client.get('/pacientes');
        return response.data;
    }

    async obtenerResumenPaciente(id) {
        const response = await this.client.get(`/pacientes/${id}/resumen`);
        return response.data;
    }
}

export default new HistorialMedicoService();