import axios from 'axios';

/**
 * Configurar interceptadores globales de Axios
 */
export const setupAxiosInterceptors = () => {
    // Interceptador de respuesta
    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            // Manejo de errores 401 (No autorizado)
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }

            // Manejo de errores 403 (Prohibido)
            if (error.response?.status === 403) {
                console.error('Acceso prohibido:', error.response.data);
            }

            // Manejo de errores 500 (Error del servidor)
            if (error.response?.status === 500) {
                console.error('Error del servidor:', error.response.data);
            }

            return Promise.reject(error);
        }
    );

    // Interceptador de solicitud
    axios.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );
};
