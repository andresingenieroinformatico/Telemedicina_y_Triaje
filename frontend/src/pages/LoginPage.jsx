import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input, FormGroup, Spinner } from '../components/UIComponents';

const LoginPage = () => {
    const [mode, setMode] = useState('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const role = 'paciente';
    const [errors, setErrors] = useState({});
    const { login, loading, error: authError, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const validateForm = () => {
        const newErrors = {};

        if (mode === 'register' && !name.trim()) newErrors.name = 'El nombre es requerido';
        if (!username.trim()) newErrors.username = 'El usuario es requerido';
        if (!password) newErrors.password = 'La contrasena es requerida';
        if (password && password.length < 4) newErrors.password = 'La contrasena debe tener al menos 4 caracteres';
        if (mode === 'register' && password !== confirmPassword) newErrors.confirmPassword = 'Las contrasenas no coinciden';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) return;

        try {
            await login(username, password, role);
            navigate('/');
        } catch (err) {
            console.error('Error de autenticacion:', err);
        }
    };

    React.useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    return (
        <main className="page-shell">
            <section className="hero-card welcome-hero" aria-labelledby="login-title">
                <p className="eyebrow" style={{ color: '#155eef' }}>Portal de acceso</p>
                <h1 id="login-title">Accede a tu experiencia clinica digital.</h1>
                <p className="muted">
                    Inicia sesion o crea tu cuenta para gestionar triage, agenda e historial clinico desde un entorno seguro y claro.
                </p>
            </section>

            <section className="hero-layout" style={{ gridTemplateColumns: '0.9fr 1.1fr' }}>
                <article className="insight-panel">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '14px' }}>
                        <h2 style={{ margin: 0 }}>Disenada para reducir friccion</h2>
                        <span className="trust-chip" style={{ color: '#155eef', background: '#eaf1ff', borderColor: '#cfe0ff' }}>Premium UX</span>
                    </div>

                    <div style={{ display: 'grid', gap: '12px' }}>
                        {[
                            ['Agenda rapida', 'Reserva y gestiona consultas medicas con pocos pasos.'],
                            ['Triage guiado', 'Registra sintomas y signos vitales con estructura clara.'],
                            ['Historial clinico', 'Centraliza antecedentes y seguimiento del paciente.'],
                        ].map(([title, text]) => (
                            <div key={title} className="section-panel">
                                <strong>{title}</strong>
                                <p className="muted" style={{ margin: '4px 0 0' }}>{text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="section-panel" style={{ marginTop: '12px', borderColor: '#bbf7d0', background: '#f0fdf4' }}>
                        <strong style={{ color: '#16803c' }}>Modo demo</strong>
                        <p className="muted" style={{ margin: '4px 0 0' }}>
                            Puedes probar el flujo con cualquier usuario y una contrasena de 4 o mas caracteres.
                        </p>
                    </div>
                </article>

                <article className="insight-panel">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginBottom: '14px' }}>
                        {['login', 'register'].map((option) => (
                            <Button
                                key={option}
                                type="button"
                                onClick={() => setMode(option)}
                                variant={mode === option ? 'primary' : 'secondary'}
                            >
                                {option === 'login' ? 'Iniciar sesion' : 'Crear cuenta'}
                            </Button>
                        ))}
                    </div>

                    <FormGroup style={{ marginBottom: 0 }}>
                        {authError && <Alert type="error" message={authError} />}

                        <form onSubmit={handleSubmit}>
                            {mode === 'register' && (
                                <Input
                                    label="Nombre completo"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    error={errors.name}
                                    required
                                    placeholder="Ej. Ana Gomez"
                                />
                            )}

                            <Input
                                label="Usuario"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                error={errors.username}
                                required
                                placeholder="paciente@telemedicina"
                            />

                            {mode === 'register' && (
                                <Alert type="info" message="Todos los registros creados desde aqui se asignan como pacientes." />
                            )}

                            <Input
                                label="Contrasena"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                required
                                placeholder="Minimo 4 caracteres"
                            />

                            {mode === 'register' && (
                                <Input
                                    label="Confirmar contrasena"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={errors.confirmPassword}
                                    required
                                    placeholder="Repite tu contrasena"
                                />
                            )}

                            <Button type="submit" disabled={loading} variant="primary" style={{ width: '100%' }}>
                                {loading ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesion'}
                            </Button>

                            {loading && <Spinner label="Validando acceso..." />}
                        </form>
                    </FormGroup>
                </article>
            </section>
        </main>
    );
};

export default LoginPage;
