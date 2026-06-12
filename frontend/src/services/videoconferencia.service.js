import axios from 'axios';
import { API_BASE_URLS } from './api.config';

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

    async crearSala(nombre, salaId = 1, descripcion = '', capacidadMax = 10) {
        try {
            const response = await this.client.post('/salas/crear', {
                nombre,
                sala_id: parseInt(salaId),
                descripcion,
                capacidad_max: parseInt(capacidadMax)
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async unirseSala(nombreSala, usuarioId, rol, salaId = 1, nombreUsuario = '') {
        try {
            const response = await this.client.post('/salas/join', {
                nombre_sala: nombreSala,
                usuario_id: parseInt(usuarioId),
                rol: rol.toLowerCase(),
                sala_id: parseInt(salaId),
                nombre_usuario: nombreUsuario
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

const videoconferenciaService = new VideoconferenciaService();
export default videoconferenciaService;
