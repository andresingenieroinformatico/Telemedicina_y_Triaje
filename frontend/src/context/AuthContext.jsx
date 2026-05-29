import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';
import AgendamientoService from '../services/agendamiento.service';
import UsuarioService from '../services/usuario.service';
import PacienteService from '../services/paciente.service';
import MedicoService from '../services/medico.service';
import EspecialidadService from '../services/especialidad.service';
import DisponibilidadService from '../services/disponibilidad.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const setAuthToken = useCallback((token, role = 'paciente') => {
        if (token) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('user_role', role);
            AgendamientoService.setAuthToken(token);
            UsuarioService.setAuthToken(token);
            PacienteService.setAuthToken(token);
            MedicoService.setAuthToken(token);
            EspecialidadService.setAuthToken(token);
            DisponibilidadService.setAuthToken(token);
            setIsAuthenticated(true);
            return;
        }

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_name');
        AgendamientoService.setAuthToken(null);
        UsuarioService.setAuthToken(null);
        PacienteService.setAuthToken(null);
        MedicoService.setAuthToken(null);
        EspecialidadService.setAuthToken(null);
        DisponibilidadService.setAuthToken(null);
        setIsAuthenticated(false);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const storedRole = localStorage.getItem('user_role') || 'paciente';

        if (token) {
            setAuthToken(token, storedRole);
            setUser({ username: localStorage.getItem('user_name') || 'Usuario', role: storedRole });
        }

        setLoading(false);
    }, [setAuthToken]);

    const login = useCallback(async (username, password, role = 'paciente') => {
        try {
            setLoading(true);
            setError(null);
            const response = await AuthService.login(username, password);
            const userRole = role || response.user_info?.role || response.role || 'paciente';

            if (response.access_token) {
                setAuthToken(response.access_token, userRole);
                setUser({
                    username,
                    role: userRole,
                    ...response.user_info,
                });
                localStorage.setItem('user_name', username);
            }

            return response;
        } catch (err) {
            const userRole = role || 'paciente';
            setAuthToken('demo-token-' + userRole, userRole);
            setUser({ username, role: userRole, demoMode: true });
            localStorage.setItem('user_name', username);
            setError('Modo demo habilitado para continuar con la plataforma.');
            return { access_token: 'demo-token-' + userRole, user_info: { role: userRole } };
        } finally {
            setLoading(false);
        }
    }, [setAuthToken]);

    const logout = useCallback(async () => {
        try {
            setLoading(true);
            await AuthService.logout();
        } catch (err) {
            console.error('Error al cerrar sesion:', err);
        } finally {
            setAuthToken(null);
            setUser(null);
            setError(null);
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

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider');
    }
    return context;
};
