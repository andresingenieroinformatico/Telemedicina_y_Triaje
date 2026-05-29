import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para el servicio de Usuarios
 */
class UsuarioService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.USUARIOS,
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

    async crear(datos) {
        try {
            const response = await this.client.post(API_ENDPOINTS.USUARIOS.CREAR, datos);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async obtener(id) {
        try {
            const response = await this.client.get(API_ENDPOINTS.USUARIOS.OBTENER(id));
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async listar(filtros = {}) {
        try {
            const response = await this.client.get(API_ENDPOINTS.USUARIOS.LISTAR, {
                params: filtros,
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

const usuarioService = new UsuarioService();
export default usuarioService;
