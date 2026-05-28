import axios from 'axios';
import { API_BASE_URLS, API_ENDPOINTS } from './api.config';

/**
 * Cliente HTTP para autenticación (Usuarios)
 */
class AuthService {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.AGENDAMIENTO, // La auth está en el microservicio de agendamiento
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async login(username, password) {
        try {
            const response = await this.client.post(API_ENDPOINTS.AUTH.LOGIN, {
                username,
                password,
            });
            // Guardar token en localStorage
            if (response.data.access_token) {
                localStorage.setItem('auth_token', response.data.access_token);
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async loginCookie(username, password) {
        try {
            const response = await this.client.post(
                API_ENDPOINTS.AUTH.LOGIN_COOKIE,
                {
                    username,
                    password,
                }
            );
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    async logout() {
        try {
            const response = await this.client.post(API_ENDPOINTS.AUTH.LOGOUT);
            localStorage.removeItem('auth_token');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }

    getToken() {
        return localStorage.getItem('auth_token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    clearAuth() {
        localStorage.removeItem('auth_token');
    }
}

export default new AuthService();
