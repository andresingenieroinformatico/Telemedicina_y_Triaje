import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import TriagePage from './pages/TriagePage';
import AgendamientoPage from './pages/AgendamientoPage';
import HistorialMedicoPage from './pages/HistorialMedicoPage';
import PacientesPage from './pages/PacientesPage';
import VideoconferenciaPage from './pages/VideoconferenciaPage';
import { setupAxiosInterceptors } from './services/axios.interceptors';
import './App.css';

setupAxiosInterceptors();

const patientModules = [
    { title: 'Agendamientos', description: 'Reserva, consulta y administra tus citas medicas.', path: '/agendamientos' },
    { title: 'Historial medico', description: 'Consulta antecedentes, signos vitales y evolucion.', path: '/historial-medico' },
];

const doctorModules = [
    { title: 'Pacientes', description: 'Consulta el directorio clínico y datos de contacto.', path: '/pacientes' },
    { title: 'Agenda Médica', description: 'Visualiza tus citas programadas y accede a telemedicina.', path: '/agendamientos' },
    { title: 'Triaje', description: 'Evaluación de síntomas y clasificación de niveles de riesgo.', path: '/triage' },
    { title: 'Historial Clínico', description: 'Consulta antecedentes y evolución del paciente.', path: '/historial-medico' },
    { title: 'Videoconferencia', description: 'Inicia consultas virtuales seguras.', path: '/videoconferencia' },
];

const publicFeatures = [
    ['Agenda inteligente', 'Reserva consultas en pocos pasos y consulta disponibilidad con una experiencia sin friccion.', '01'],
    ['Triage guiado', 'Prioriza sintomas y orientacion clinica para responder con mas velocidad y seguridad.', '02'],
    ['Historial centralizado', 'Antecedentes, medicamentos y evolucion clinica en una vista clara y accionable.', '03'],
    ['Flujos por rol', 'Experiencias diferenciadas para pacientes y medicos.', '04'],
];

const conversionHighlights = [
    ['Sin friccion', 'Acceso claro para pacientes nuevos y recurrentes.'],
    ['Clinico primero', 'Informacion priorizada para decisiones mas rapidas.'],
    ['Preparado para crecer', 'Base visual consistente para nuevos modulos.'],
];

const processSteps = [
    ['01', 'Ingresa o registrate', 'Crea tu acceso y entra al portal en segundos.'],
    ['02', 'Elige el modulo', 'Agenda, triage e historial conectados en una misma experiencia.'],
    ['03', 'Actua con claridad', 'Gestiona citas, sintomas y seguimiento con menos esfuerzo.'],
];

// --- COMPONENTES LOCALES (Movidos arriba y convertidos a function para hoisting) ---

function PublicLanding() {
    return (
        <main className="page-shell">
            <section className="hero-layout" aria-labelledby="home-title">
                <article className="hero-panel">
                    <p className="eyebrow">Telemedicina / Triage / Seguimiento</p>
                    <h1 id="home-title" className="hero-title">
                        Salud digital que se siente impecable desde el primer clic.
                    </h1>
                    <p className="hero-copy">
                        Una plataforma de telemedicina con agenda, triage e historial clinico disenada para transmitir confianza, velocidad y precision.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="cta">Empezar ahora</Link>
                        <Link to="/login?mode=register" className="ghost-cta">Crear cuenta</Link>
                    </div>
                    <div className="chip-row" aria-label="Beneficios principales">
                        {['Atencion remota', 'Agenda centralizada', 'Datos clinicos seguros'].map((item) => (
                            <span key={item} className="trust-chip">{item}</span>
                        ))}
                    </div>
                </article>

                <aside className="insight-panel" aria-label="Indicadores de plataforma">
                    <img
                        src="/trabajo.png"
                        alt="Profesional de salud revisando una consulta medica digital"
                        loading="eager"
                        fetchpriority="high"
                        width="800"
                        height="350"
                        className="landing-visual"
                    />
                    <div className="metric-grid">
                        {[
                            ['24/7', 'Acceso a orientacion y seguimiento'],
                            ['3 min', 'Tiempo medio para agendar'],
                            ['95%', 'Satisfaccion del usuario'],
                            ['360', 'Vista clinica del paciente'],
                        ].map(([value, label]) => (
                            <div key={label} className="metric">
                                <strong>{value}</strong>
                                <span>{label}</span>
                            </div>
                        ))}
                    </div>
                </aside>
            </section>

            <section className="feature-grid" aria-label="Capacidades de la plataforma">
                {publicFeatures.map(([title, description, icon]) => (
                    <article key={title} className="feature-card">
                        <span className="feature-icon" aria-hidden="true">{icon}</span>
                        <h2>{title}</h2>
                        <p>{description}</p>
                    </article>
                ))}
            </section>

            <section className="process-section" aria-labelledby="process-title">
                <div>
                    <p className="eyebrow" style={{ color: '#175cd3' }}>Conversion simple</p>
                    <h2 id="process-title">De interes a atencion en tres pasos.</h2>
                </div>
                <div className="step-grid">
                    {processSteps.map(([number, title, description]) => (
                        <article key={title} className="step-card">
                            <span>{number}</span>
                            <strong>{title}</strong>
                            <p>{description}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}

function HomePage() {
    const { isAuthenticated, user } = useAuth();
    const modules = user?.role?.toLowerCase() === 'medico' ? doctorModules : patientModules;

    if (isAuthenticated) {
        return (
            <main className="page-shell">
                <section className="hero-card welcome-hero" aria-labelledby="welcome-title">
                    <p className="eyebrow" style={{ color: '#175cd3' }}>Centro operativo</p>
                    <h1 id="welcome-title">
                        Hola, {user?.nombre || user?.username || 'usuario'}. {user?.role?.toLowerCase() === 'medico' ? 'Tu panel médico está listo.' : 'Tu portal de salud está listo.'}
                    </h1>
                    <p className="muted">
                        Continua con citas, triage y seguimiento clinico desde una interfaz clara, rapida y confiable.
                    </p>
                </section>

                <section className="feature-grid" aria-label="Modulos disponibles">
                    {modules.map((module) => (
                        <article key={module.title} className="feature-card">
                            <span className="feature-icon" aria-hidden="true">+</span>
                            <h2>{module.title}</h2>
                            <p>{module.description}</p>
                            <Link to={module.path} className="module-link">Abrir modulo</Link>
                        </article>
                    ))}
                </section>
            </main>
        );
    }

    return <PublicLanding />;
}

function Navigation() {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const modules = user?.role?.toLowerCase() === 'medico' ? doctorModules : patientModules;

    const handleLogout = async () => {
        await logout();
        navigate('/landing');
    };

    return (
        <nav className="app-nav" aria-label="Navegacion principal">
            <div className="nav-group">
                <Link to="/" className="nav-brand" aria-label="Ir al inicio">
                    <span className="brand-mark" aria-hidden="true">+</span>
                    Telemedicina
                </Link>
                {isAuthenticated && modules.map((module) => (
                    <Link key={module.path} to={module.path} className="nav-link">
                        {module.title}
                    </Link>
                ))}
            </div>

            <div className="nav-actions">
                {isAuthenticated ? (
                    <>
                        <span className="nav-user">{user?.username || 'Usuario'}</span>
                        <button className="nav-logout" onClick={handleLogout}>
                            Salir
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="nav-login">
                            Iniciar sesion
                        </Link>
                        <Link to="/login?mode=register" className="nav-register">
                            Registrarse
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

function MainApp() {
    return (
        <Router>
            <div className="App">
                <Navigation />

                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/landing" element={<PublicLanding />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/triage"
                        element={
                            <ProtectedRoute allowedRoles={['medico']}>
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
                        path="/pacientes"
                        element={
                            <ProtectedRoute allowedRoles={['medico']}>
                                <PacientesPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/videoconferencia"
                        element={
                            <ProtectedRoute allowedRoles={['medico']}>
                                <VideoconferenciaPage />
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

function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

export default App;
