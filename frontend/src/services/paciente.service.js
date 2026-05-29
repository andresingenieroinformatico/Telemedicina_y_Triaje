import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el servicio de Pacientes
 */
class PacienteService {
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

    async listar(filtros = {}) {
        try {
            const response = await this.client.get(API_ENDPOINTS.PACIENTES.LIST, {
                params: filtros,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async crear(datos) {
        try {
            const response = await this.client.post(API_ENDPOINTS.PACIENTES.CREATE, datos);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtener(id) {
        try {
            const response = await this.client.get(API_ENDPOINTS.PACIENTES.DETAIL(id));
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async actualizar(id, datos) {
        try {
            const response = await this.client.put(API_ENDPOINTS.PACIENTES.UPDATE(id), datos);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async buscarPorDocumento(numero) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.PACIENTES.SEARCH_DOC(numero)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

const pacienteService = new PacienteService();
export default pacienteService;
