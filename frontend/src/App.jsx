import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import TriagePage from './pages/TriagePage';
import AgendamientoPage from './pages/AgendamientoPage';
import './App.css';

/**
 * Componente principal de la aplicación
 */
const App = () => {
    return (
        <Router>
            <div className="App">
                <nav style={{ backgroundColor: '#333', padding: '10px' }}>
                    <Link to="/" style={{ color: 'white', marginRight: '20px' }}>
                        🏥 Telemedicina
                    </Link>
                    <Link to="/login" style={{ color: 'white', marginRight: '20px' }}>
                        Login
                    </Link>
                    <Link to="/triage" style={{ color: 'white', marginRight: '20px' }}>
                        Triaje
                    </Link>
                    <Link to="/agendamientos" style={{ color: 'white' }}>
                        Agendamientos
                    </Link>
                </nav>

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/triage" element={<TriagePage />} />
                    <Route path="/agendamientos" element={<AgendamientoPage />} />
                </Routes>
            </div>
        </Router>
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
