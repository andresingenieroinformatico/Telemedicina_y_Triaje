import React, { createContext, useState, useEffect, useCallback } from 'react';
import AuthService from '../services/auth.service';
import AgendamientoService from '../services/agendamiento.service';
import HistorialMedicoService from '../services/historial-medico.service';
import UsuarioService from '../services/usuario.service';
import PacienteService from '../services/paciente.service';
import MedicoService from '../services/medico.service';
import EspecialidadService from '../services/especialidad.service';
import DisponibilidadService from '../services/disponibilidad.service';
import VideoconferenciaService from '../services/videoconferencia.service';

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
            VideoconferenciaService.setAuthToken(token);
            HistorialMedicoService.setAuthToken(token);
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
        VideoconferenciaService.setAuthToken(null);
        HistorialMedicoService.setAuthToken(null);
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

    const login = async (username, password, role) => {
        setLoading(true);
        setError('');
        try {
            // BYPASS TOTAL PARA PRUEBAS: Permitir ingreso inmediato sin validar con el backend
            const userRole = role || 'paciente';
            const fakeToken = 'bypass-token-' + userRole;
            
            setAuthToken(fakeToken, userRole);
            setUser({ username: username || 'usuario_prueba', role: userRole, demoMode: true });
            localStorage.setItem('user_name', username || 'usuario_prueba');
            
            setLoading(false);
            return { access_token: fakeToken, user_info: { role: userRole } };
        } catch (err) {
            setError('Error inesperado al iniciar sesión.');
            setLoading(false);
            throw err;
        }
    };

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
