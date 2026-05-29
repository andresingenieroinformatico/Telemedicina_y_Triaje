import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TriagePage from './pages/TriagePage';
import AgendamientoPage from './pages/AgendamientoPage';
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
        <nav style={{ backgroundColor: '#333', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
                <Link to="/" style={{ color: 'white', marginRight: '20px', textDecoration: 'none', fontSize: '16px', fontWeight: 'bold' }}>
                    🏥 Telemedicina
                </Link>
                {isAuthenticated && (
                    <>
                        <Link to="/triage" style={{ color: 'white', marginRight: '20px', textDecoration: 'none' }}>
                            Triaje
                        </Link>
                        <Link to="/agendamientos" style={{ color: 'white', textDecoration: 'none' }}>
                            Agendamientos
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
    <div style={{ maxWidth: '800px', margin: '50px auto' }}>
        <h1>🏥 Plataforma de Telemedicina y Triaje Automatizado</h1>
        <p>Bienvenido a la plataforma de telemedicina.</p>
        <div>
            <h2>Funcionalidades:</h2>
            <ul>
                <li>
                    <strong>Triaje Automatizado:</strong> Evaluación de riesgo de pacientes
                </li>
                <li>
                    <strong>Agendamiento de Citas:</strong> Gestión de consultas médicas
                </li>
                <li>
                    <strong>Autenticación:</strong> Control de acceso por usuario y rol
                </li>
            </ul>
        </div>
    </div>
);

export default App;
