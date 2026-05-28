import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el servicio de Disponibilidad
 */
class DisponibilidadService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.AGENDAMIENTO,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.client.defaults.headers.Authorization;
        }
    }

    async obtenerPorMedico(medico_id) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.DISPONIBILIDAD.GET_MEDICO(medico_id)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async crear(datos) {
        try {
            const response = await this.client.post(API_ENDPOINTS.DISPONIBILIDAD.CREATE, datos);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async eliminar(id) {
        try {
            const response = await this.client.delete(API_ENDPOINTS.DISPONIBILIDAD.DELETE(id));
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new DisponibilidadService();
