import axios from 'axios';
import { API_BASE_URLS } from './api.config'; // Asume que api.config.js existe y se actualizará

class VideoconferenciaService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.VIDEOCONFERENCIA,
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

    async listarSalas() {
        const response = await this.client.get('/salas');
        return response.data;
    }

    async obtenerSala(id) {
        const response = await this.client.get(`/salas/${id}`);
        return response.data;
    }

    async obtenerLinkAccesoSala(salaId, usuarioId, rol, nombreUsuario = '') {
        const response = await this.client.get(`/salas/${salaId}/join`, { params: { usuario_id: usuarioId, rol, nombre_usuario: nombreUsuario } });
        return response.data;
    }
}

export default new VideoconferenciaService();