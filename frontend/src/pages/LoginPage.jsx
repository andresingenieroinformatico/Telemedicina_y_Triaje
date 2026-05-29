import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Button, Input, FormGroup, Spinner } from '../components/UIComponents';

/**
 * Página de Login
 */
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

    // Validaciones
    const validateForm = () => {
        const newErrors = {};

        if (mode === 'register' && !name.trim()) {
            newErrors.name = 'El nombre es requerido para crear la cuenta';
        }
        if (!username.trim()) {
            newErrors.username = 'El usuario es requerido';
        }
        if (!password) {
            newErrors.password = 'La contraseña es requerida';
        }
        if (password && password.length < 4) {
            newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
        }
        if (mode === 'register' && password !== confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        try {
            if (mode === 'register') {
                await login(username, password, role);
                navigate('/');
                return;
            }

            await login(username, password, role);
            navigate('/');
        } catch (err) {
            console.error('Error de autenticación:', err);
        }
    };

    // Si ya está autenticado, redirigir a inicio
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '18px 18px 40px' }}>
            <header style={{ position: 'sticky', top: '56px', zIndex: 6, marginBottom: '18px' }}>
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #172554 45%, #2563eb 100%)', color: 'white', borderRadius: '24px', padding: '18px 20px', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)', border: '1px solid rgba(191,219,254,0.15)' }}>
                    <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#bfdbfe', fontWeight: 800, fontSize: '11px' }}>Portal de acceso</p>
                    <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', margin: '6px 0 8px' }}>Tu experiencia clínica, con una interfaz premium.</h1>
                    <p style={{ color: '#e5eefb', fontSize: '0.98rem', maxWidth: '700px', lineHeight: 1.5 }}>Inicia sesión o crea tu cuenta para acceder a triage, agenda y seguimiento clínico con una experiencia más clara, segura y profesional.</p>
                </div>
            </header>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '18px', alignItems: 'stretch' }}>
                <article style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)', borderRadius: '24px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 18px 32px rgba(15, 23, 42, 0.10)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.08rem', margin: 0 }}>Por qué los pacientes eligen esta plataforma</h2>
                        <span style={{ fontSize: '0.85rem', color: '#2563eb', background: '#eff6ff', borderRadius: '999px', padding: '6px 10px', fontWeight: 700 }}>Diseño premium</span>
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {[
                            ['Agenda rápida', 'Reserva y gestiona tus consultas médicas.'],
                            ['Triage guiado', 'Evalúa síntomas y prioriza tu atención.'],
                            ['Historial clínico', 'Consulta antecedentes y seguimiento.'],
                        ].map(([title, text]) => (
                            <div key={title} style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)', borderRadius: '16px', padding: '12px', border: '1px solid #dbeafe', boxShadow: '0 8px 16px rgba(37,99,235,0.08)' }}>
                                <strong style={{ display: 'block', color: '#1d4ed8', marginBottom: '4px' }}>{title}</strong>
                                <span style={{ color: '#334155', fontSize: '0.94rem' }}>{text}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '12px', background: 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)', borderRadius: '16px', padding: '12px', border: '1px solid #bbf7d0', boxShadow: '0 10px 18px rgba(22,163,74,0.08)' }}>
                        <strong style={{ display: 'block', color: '#15803d', marginBottom: '4px' }}>Modo demo</strong>
                        <p style={{ color: '#334155', fontSize: '0.94rem', lineHeight: 1.45 }}>
                            Puedes probar el flujo con cualquier usuario y contraseña de 4 o más caracteres. La plataforma está preparada para continuar con el backend real en el próximo paso.
                        </p>
                    </div>
                </article>

                <article style={{ background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)', borderRadius: '24px', padding: '18px', border: '1px solid #e5e7eb', boxShadow: '0 18px 32px rgba(15, 23, 42, 0.10)' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                        {['login', 'register'].map((option) => (
                            <button
                                key={option}
                                type="button"
                                onClick={() => setMode(option)}
                                style={{
                                    flex: 1,
                                    padding: '10px 12px',
                                    borderRadius: '10px',
                                    border: mode === option ? '1px solid #2563eb' : '1px solid #dbe4ee',
                                    background: mode === option ? 'linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)' : '#f8fafc',
                                    color: mode === option ? '#1d4ed8' : '#334155',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                }}
                            >
                                {option === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                            </button>
                        ))}
                    </div>

                    <FormGroup style={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '18px', padding: '14px', boxShadow: '0 10px 18px rgba(15, 23, 42, 0.06)' }}>
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
                                    placeholder="Ej. Ana Gómez"
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
                                <div style={{ marginBottom: '10px', color: '#0f766e', fontSize: '0.92rem' }}>
                                    Todos los registros creados desde aquí serán pacientes.
                                </div>
                            )}

                            <Input
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                error={errors.password}
                                required
                                placeholder="Mínimo 4 caracteres"
                            />

                            {mode === 'register' && (
                                <Input
                                    label="Confirmar contraseña"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    error={errors.confirmPassword}
                                    required
                                    placeholder="Repite tu contraseña"
                                />
                            )}

                            <div style={{ marginTop: '8px' }}>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant="primary"
                                    style={{ width: '100%', borderRadius: '12px', padding: '11px 14px', boxShadow: '0 10px 18px rgba(37,99,235,0.18)' }}
                                >
                                    {loading ? 'Procesando...' : mode === 'register' ? 'Crear cuenta' : 'Iniciar sesión'}
                                </Button>
                            </div>

                            {loading && <Spinner />}
                        </form>
                    </FormGroup>
                </article>
            </section>
        </div>
    );
};

export default LoginPage;
