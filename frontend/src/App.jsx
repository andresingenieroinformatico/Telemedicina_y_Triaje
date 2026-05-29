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
                {isAuthenticated && (
                    <>
                        <Link to="/triage" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>
                            Triaje
                        </Link>
                        <Link to="/agendamientos" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>
                            Agendamientos
                        </Link>
                        <Link to="/usuarios" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>
                            Usuarios
                        </Link>
                        <Link to="/historial-medico" className="nav-link" style={{ color: 'white', textDecoration: 'none' }}>
                            Historial Médico
                        </Link>
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
                            <ProtectedRoute>
                                <TriagePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/agendamientos"
                        element={
                            <ProtectedRoute>
                                <AgendamientoPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/usuarios"
                        element={
                            <ProtectedRoute>
                                <UsuariosPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/historial-medico"
                        element={
                            <ProtectedRoute>
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
const HomePage = () => (
    <div style={{ maxWidth: '1100px', margin: '32px auto', padding: '0 18px 40px' }}>
        <section className="hero-card" style={{ background: 'linear-gradient(135deg, #eff6ff, #ffffff)', borderRadius: '18px', padding: '24px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)', marginBottom: '18px' }}>
            <p style={{ textTransform: 'uppercase', letterSpacing: '0.18em', color: '#2563eb', fontWeight: 700, fontSize: '12px' }}>Frontend · rama de mejoras</p>
            <h1 style={{ fontSize: '2rem', margin: '8px 0 10px' }}>Plataforma de Telemedicina y Triaje Automatizado</h1>
            <p style={{ color: '#475569', maxWidth: '720px', lineHeight: 1.5 }}>
                Esta vista central reúne los módulos principales del proyecto y ofrece una base más clara para continuar con el desarrollo del frontend.
            </p>
        </section>

        <section className="feature-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
                ['Triaje Automatizado', 'Evaluación de riesgo, signos vitales y alertas clínicas.', '/triage'],
                ['Agendamiento de Citas', 'Gestión de consultas, disponibilidad y seguimiento.', '/agendamientos'],
                ['Usuarios', 'Módulo base para cuentas, roles y seguridad.', '/usuarios'],
                ['Historial Médico', 'Pacientes, consultas, medicamentos y signos clínicos.', '/historial-medico'],
            ].map(([title, description, path]) => (
                <article key={title} className="feature-card" style={{ background: 'white', borderRadius: '16px', padding: '18px', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.08)', border: '1px solid #e5e7eb' }}>
                    <h2 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>{title}</h2>
                    <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.4 }}>{description}</p>
                    <Link to={path} style={{ display: 'inline-block', marginTop: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 700 }}>
                        Abrir módulo →
                    </Link>
                </article>
            ))}
        </section>
    </div>
);

export default App;
