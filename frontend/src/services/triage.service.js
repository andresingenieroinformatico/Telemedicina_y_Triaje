import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el servicio de Triaje
 */
class TriageService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.TRIAGE,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async evaluar(id_paciente, sintomas, signos_vitales) {
        try {
            const response = await this.client.post(API_ENDPOINTS.TRIAGE.EVALUAR, {
                id_paciente,
                sintomas,
                signos_vitales,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtenerHistorial(id_paciente) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.TRIAGE.HISTORIAL(id_paciente)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new TriageService();
