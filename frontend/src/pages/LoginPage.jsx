import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input, FormGroup, Spinner } from '../components/UIComponents';

/**
 * Página de Login
 */
const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('paciente');
    const [errors, setErrors] = useState({});
    const { login, loading, error: authError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Validaciones
    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = 'El usuario es requerido';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        }
        if (password && password.length < 4) {
            newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            await login(username, password, role);
            navigate('/');
        } catch (err) {
            console.error('Error de login:', err);
        }
    };

    // Si ya está autenticado, redirigir a inicio
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h1>🏥 Telemedicina</h1>
                <p style={{ color: '#666' }}>Plataforma de Telemedicina y Triaje Automatizado</p>
            </div>

            <FormGroup>
                {authError && <Alert type="error" message={authError} />}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ingresar como</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ced4da' }}
                        >
                            <option value="paciente">Paciente</option>
                            <option value="medico">Médico</option>
                        </select>
                    </div>

                    <Input
                        label="Usuario"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={errors.username}
                        required
                        placeholder={role === 'medico' ? 'medico@telemedicina' : 'paciente@telemedicina'}
                    />

                    <Input
                        label="Contraseña"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={errors.password}
                        required
                        placeholder="Ingrese su contraseña"
                    />

                    <div style={{ marginTop: '20px' }}>
                        <Button
                            type="submit"
                            disabled={loading}
                            variant="primary"
                            style={{ width: '100%' }}
                        >
                            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </div>

                    {loading && <Spinner />}
                </form>
            </FormGroup>

            <div style={{ marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }}>
                <p>Modo demo: puedes entrar como <strong>Paciente</strong> o <strong>Médico</strong> sin depender del backend aún.</p>
                <p>Ejemplo: usuario <strong>paciente</strong> o <strong>medico</strong> con cualquier contraseña de 4+ caracteres.</p>
            </div>
        </div>
    );
};

export default LoginPage;
