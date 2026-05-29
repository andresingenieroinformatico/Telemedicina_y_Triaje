import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el servicio de Agendamientos
 */
class AgendamientoService {
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
            const response = await this.client.get(API_ENDPOINTS.AGENDAMIENTOS.LIST, {
                params: filtros,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async crear(datos) {
        try {
            const response = await this.client.post(
                API_ENDPOINTS.AGENDAMIENTOS.CREATE,
                datos
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtener(id) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.AGENDAMIENTOS.DETAIL(id)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async cambiarEstado(id, nuevoEstado, observacion = '') {
        try {
            const response = await this.client.patch(
                API_ENDPOINTS.AGENDAMIENTOS.UPDATE_ESTADO(id),
                {
                    estado: nuevoEstado,
                    observacion,
                    modificado_por: 'frontend_user',
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async cancelar(id, motivo = '') {
        try {
            const response = await this.client.delete(
                API_ENDPOINTS.AGENDAMIENTOS.CANCEL(id),
                {
                    data: { motivo_cancelacion: motivo },
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtenerHistorial(id) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.AGENDAMIENTOS.HISTORIAL(id)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtenerSlots(medico_id, fecha) {
        try {
            const response = await this.client.get(API_ENDPOINTS.AGENDAMIENTOS.SLOTS, {
                params: { medico_id, fecha },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async buscarPorCodigo(codigo) {
        try {
            const response = await this.client.get(
                API_ENDPOINTS.AGENDAMIENTOS.SEARCH_CODIGO(codigo)
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

const agendamientoService = new AgendamientoService();
export default agendamientoService;
