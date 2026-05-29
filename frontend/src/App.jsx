import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TriagePage from './pages/TriagePage';
import AgendamientoPage from './pages/AgendamientoPage';
import UsuariosPage from './pages/UsuariosPage';
import HistorialMedicoPage from './pages/HistorialMedicoPage';
import { setupAxiosInterceptors } from './services/axios.interceptors';
import './App.css';

// Configurar interceptadores globales
setupAxiosInterceptors();

/**
 * Componente de navegación
 */
const Navigation = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="app-nav" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)' }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <Link to="/" className="nav-brand" style={{ color: 'white', marginRight: '8px', textDecoration: 'none', fontSize: '16px', fontWeight: '700' }}>
                    🏥 Telemedicina
                </Link>
                {isAuthenticated && user?.role === 'paciente' && (
                    <>
                        <Link to="/triage" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Triage</Link>
                        <Link to="/agendamientos" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Mis Citas</Link>
                        <Link to="/historial-medico" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Mi Historial</Link>
                    </>
                )}
                {isAuthenticated && user?.role === 'medico' && (
                    <>
                        <Link to="/triage" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Pacientes en Triage</Link>
                        <Link to="/agendamientos" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Agenda</Link>
                        <Link to="/usuarios" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>Usuarios</Link>
                    </>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {isAuthenticated ? (
                    <>
                        <span style={{ color: 'white' }}>👤 {user?.username || 'Usuario'}</span>
                        <button
                            onClick={handleLogout}
                            style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '8px 15px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

/**
 * Componente de contenido principal
 */
const MainApp = () => {
    return (
        <Router>
            <div className="App">
                <Navigation />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/triage"
                        element={
                            <ProtectedRoute allowedRoles={['paciente', 'medico']}>
                                <TriagePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agendamientos"
                        element={
                            <ProtectedRoute allowedRoles={['paciente', 'medico']}>
                                <AgendamientoPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute allowedRoles={['medico']}>
                                <UsuariosPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/historial-medico"
                        element={
                            <ProtectedRoute allowedRoles={['paciente', 'medico']}>
                                <HistorialMedicoPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </div>
        </Router>
    );
};

/**
 * Componente principal de la aplicación
 */
const App = () => {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
};

/**
 * Página de inicio
 */
const HomePage = () => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        return (
            <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 18px 40px' }}>
                <section className="hero-card" style={{ background: 'linear-gradient(135deg, #eff6ff, #ffffff)', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', marginBottom: '18px' }}>
                    <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2563eb', fontWeight: 700, fontSize: '12px' }}>Bienvenido de nuevo</p>
                    <h1 style={{ fontSize: '2rem', margin: '8px 0 10px' }}>Hola, {user?.username || 'usuario'} · {user?.role === 'medico' ? 'Panel médico' : 'Portal del paciente'}</h1>
                    <p style={{ color: '#475569', maxWidth: '760px', lineHeight: 1.5 }}>
                        Continúa con tus próximas citas, triage y seguimiento clínico desde aquí.
                    </p>
                </section>

                <section className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    {[
                        ['Triage', 'Revisa y prioriza el estado clínico del paciente.', '/triage'],
                        ['Agendamientos', 'Gestiona reservas y agenda médica.', '/agendamientos'],
                        ['Historial Médico', 'Consulta antecedentes y seguimiento clínico.', '/historial-medico'],
                        ['Usuarios', 'Administra cuentas y roles del equipo.', '/usuarios'],
                    ].map(([title, description, path]) => (
                        <article key={title} className="feature-card" style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
                            <h2 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{title}</h2>
                            <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.4 }}>{description}</p>
                            <Link to={path} style={{ display: 'inline-block', marginTop: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>Abrir módulo →</Link>
                        </article>
                    ))}
                </section>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 18px 40px' }}>
            <section style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '18px', alignItems: 'center', marginTop: '24px', marginBottom: '18px' }}>
                <article className="hero-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #2563eb 100%)', color: 'white', borderRadius: '24px', padding: '28px', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.18)' }}>
                    <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#bfdbfe', fontWeight: 700, fontSize: '12px' }}>Telemedicina · Triaje · Atención integral</p>
                    <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.1rem)', lineHeight: 1.08, margin: '10px 0 14px' }}>Tu atención médica, más rápida, clara y cercana desde cualquier lugar.</h1>
                    <p style={{ color: '#e2e8f0', maxWidth: '640px', lineHeight: 1.6, fontSize: '1.02rem' }}>
                        Agenda consultas, recibe orientación de triage y sigue tu historial clínico con una experiencia pensada para pacientes y médicos.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '18px' }}>
                        <Link to="/login" style={{ background: '#ffffff', color: '#0f172a', textDecoration: 'none', padding: '11px 16px', borderRadius: '10px', fontWeight: 800 }}>Iniciar sesión</Link>
                        <Link to="/login" style={{ background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.5)', textDecoration: 'none', padding: '11px 16px', borderRadius: '10px', fontWeight: 800 }}>Registrarse</Link>
                    </div>
                    <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '18px', color: '#eff6ff' }}>
                        {['Atención remota', 'Seguimiento clínico', 'Agenda y triage'].map((item) => (
                            <span key={item} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '999px', padding: '8px 10px', fontSize: '0.95rem' }}>{item}</span>
                        ))}
                    </div>
                </article>

                <article style={{ background: 'white', borderRadius: '24px', padding: '18px', boxShadow: '0 18px 36px rgba(15, 23, 42, 0.12)', border: '1px solid #e5e7eb' }}>
                    <img src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80" alt="Médico atendiendo a paciente en consulta virtual" style={{ width: '100%', borderRadius: '18px', height: '280px', objectFit: 'cover' }} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
                        {[
                            ['24/7', 'Acceso a orientación y seguimiento'],
                            ['+500', 'Pacientes atendidos'],
                            ['95%', 'Satisfacción del usuario'],
                            ['3 min', 'Tiempo medio para agendar'],
                        ].map(([value, label]) => (
                            <div key={label} style={{ background: '#eff6ff', borderRadius: '14px', padding: '10px', border: '1px solid #dbeafe' }}>
                                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#1d4ed8' }}>{value}</strong>
                                <span style={{ color: '#334155', fontSize: '0.92rem' }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </article>
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                {[
                    ['Agenda rápida', 'Reserva tus consultas en pocos pasos y consulta disponibilidad en tiempo real.', '🗓️'],
                    ['Triage inteligente', 'Prioriza síntomas y orientación clínica para una atención más segura.', '🩺'],
                    ['Historial de salud', 'Revisa antecedentes, medicamentos y evolución clínica en un solo lugar.', '📋'],
                    ['Atención para todos', 'Diseñada para pacientes y médicos con flujos simples y claros.', '🤝'],
                ].map(([title, description, emoji]) => (
                    <article key={title} className="feature-card" style={{ background: 'white', borderRadius: '18px', padding: '18px', boxShadow: '0 14px 28px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{emoji}</div>
                        <h2 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{title}</h2>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.45 }}>{description}</p>
                    </article>
                ))}
            </section>

            <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <article style={{ background: 'linear-gradient(135deg, #ecfeff, #ffffff)', borderRadius: '18px', padding: '18px', border: '1px solid #cffafe', boxShadow: '0 12px 24px rgba(14, 116, 144, 0.08)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>¿Por qué elegir esta plataforma?</h2>
                    <ul style={{ color: '#334155', paddingLeft: '18px', lineHeight: 1.6 }}>
                        <li>Experiencia de usuario clara y amigable para pacientes.</li>
                        <li>Flujos orientados a una atención más rápida y organizada.</li>
                        <li>Integración de triage, agenda y seguimiento clínico.</li>
                    </ul>
                </article>

                <article style={{ background: 'linear-gradient(135deg, #f0fdf4, #ffffff)', borderRadius: '18px', padding: '18px', border: '1px solid #dcfce7', boxShadow: '0 12px 24px rgba(22, 163, 74, 0.08)' }}>
                    <h2 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Tu primer paso es muy simple</h2>
                    <ol style={{ color: '#334155', paddingLeft: '18px', lineHeight: 1.6 }}>
                        <li>Regístrate o inicia sesión.</li>
                        <li>Elige tu rol: paciente o médico.</li>
                        <li>Accede a los módulos de consulta, triage o agenda.</li>
                    </ol>
                </article>
            </section>
        </div>
    );
};

export default App;
