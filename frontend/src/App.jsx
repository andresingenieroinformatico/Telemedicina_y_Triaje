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
        <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 18px 40px' }}>
            <section className="hero-card" style={{ background: 'linear-gradient(135deg, #eff6ff, #ffffff)', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', marginBottom: '18px' }}>
                <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2563eb', fontWeight: 700, fontSize: '12px' }}>Telemedicina · Triaje · Atención integral</p>
                <h1 style={{ fontSize: '2rem', margin: '8px 0 10px' }}>Una plataforma clara para agendar, evaluar y acompañar la atención médica.</h1>
                <p style={{ color: '#475569', maxWidth: '760px', lineHeight: 1.5 }}>
                    Conoce los servicios de la plataforma, explora cómo funciona la atención remota y accede con tu cuenta para continuar tu experiencia clínica.
                </p>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '14px' }}>
                    <Link to="/login" style={{ background: '#2563eb', color: 'white', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700 }}>Iniciar sesión</Link>
                    <Link to="/login" style={{ background: '#0f172a', color: 'white', textDecoration: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 700 }}>Registrarse</Link>
                </div>
            </section>

            <section className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {[
                    ['Agendamiento de citas', 'Reserva consultas, revisa disponibilidad y administra tu agenda desde un solo lugar.', 'login'],
                    ['Triage automatizado', 'Evalúa prioridad clínica, síntomas y alertas para acompañar mejor la atención.', 'login'],
                    ['Historial médico', 'Mantén un seguimiento de antecedentes y evolución clínica.', 'login'],
                    ['Soporte y seguridad', 'Accede con credenciales seguras y una experiencia pensada para pacientes y médicos.', 'login'],
                ].map(([title, description]) => (
                    <article key={title} className="feature-card" style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{title}</h2>
                        <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.4 }}>{description}</p>
                    </article>
                ))}
            </section>
        </div>
    );
};

export default App;
