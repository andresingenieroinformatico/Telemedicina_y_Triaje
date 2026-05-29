import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';
import AgendamientoService from '../services/agendamiento.service';
import UsuarioService from '../services/usuario.service';
import PacienteService from '../services/paciente.service';
import MedicoService from '../services/medico.service';
import EspecialidadService from '../services/especialidad.service';
import DisponibilidadService from '../services/disponibilidad.service';

/**
 * Contexto de autenticación global
 */
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Verificar autenticación al montar
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            setIsAuthenticated(true);
            setAuthToken(token);
            // Aquí podrías obtener los datos del usuario
        }
        setLoading(false);
    }, [setAuthToken]);

    const setAuthToken = useCallback((token) => {
        if (token) {
            localStorage.setItem('auth_token', token);
            AgendamientoService.setAuthToken(token);
            UsuarioService.setAuthToken(token);
            PacienteService.setAuthToken(token);
            MedicoService.setAuthToken(token);
            EspecialidadService.setAuthToken(token);
            DisponibilidadService.setAuthToken(token);
            setIsAuthenticated(true);
        } else {
            localStorage.removeItem('auth_token');
            AgendamientoService.setAuthToken(null);
            UsuarioService.setAuthToken(null);
            PacienteService.setAuthToken(null);
            MedicoService.setAuthToken(null);
            EspecialidadService.setAuthToken(null);
            DisponibilidadService.setAuthToken(null);
            setIsAuthenticated(false);
        }
    }, []);

    const login = useCallback(async (username, password) => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.login(username, password);
            
            if (response.access_token) {
                setAuthToken(response.access_token);
                setUser({
                    username,
                    ...response.user_info,
                });
            }
            return response;
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al iniciar sesión';
            setError(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setAuthToken]);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await AuthService.logout();
            setAuthToken(null);
            setUser(null);
            setError(null);
        } catch (err) {
            console.error('Error al cerrar sesión:', err);
        } finally {
            setLoading(false);
        }
    }, [setAuthToken]);

    const value = {
        user,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        setAuthToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};
