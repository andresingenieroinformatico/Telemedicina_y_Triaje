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
            await login(username, password);
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
                    <Input
                        label="Usuario"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        error={errors.username}
                        required
                        placeholder="Ingrese su usuario"
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
                <p>Usuario de prueba: <strong>admin</strong></p>
                <p>Contraseña: <strong>password</strong></p>
            </div>
        </div>
    );
};

export default LoginPage;
