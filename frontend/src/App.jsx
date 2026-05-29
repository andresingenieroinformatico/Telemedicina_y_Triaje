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

setupAxiosInterceptors();

const patientModules = [
    { title: 'Triage', description: 'Evalua sintomas y prioriza la atencion clinica.', path: '/triage' },
    { title: 'Agendamientos', description: 'Reserva, consulta y administra tus citas medicas.', path: '/agendamientos' },
    { title: 'Historial medico', description: 'Consulta antecedentes, signos vitales y evolucion.', path: '/historial-medico' },
];

const doctorModules = [
    { title: 'Pacientes en triage', description: 'Revisa casos, riesgo y prioridad de atencion.', path: '/triage' },
    { title: 'Agenda', description: 'Gestiona reservas y disponibilidad medica.', path: '/agendamientos' },
    { title: 'Usuarios', description: 'Administra cuentas, roles y acceso del equipo.', path: '/usuarios' },
];

const publicFeatures = [
    ['Agenda rapida', 'Reserva consultas en pocos pasos y consulta disponibilidad con claridad.', '01'],
    ['Triage guiado', 'Prioriza sintomas y orientacion clinica para una atencion mas segura.', '02'],
    ['Historial centralizado', 'Antecedentes, medicamentos y evolucion clinica en un solo lugar.', '03'],
    ['Flujos por rol', 'Experiencias claras para pacientes, medicos y equipos administrativos.', '04'],
];

const Navigation = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();
    const modules = user?.role === 'medico' ? doctorModules : patientModules;

    const handleLogout = async () => {
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
                    <Link to="/login" className="nav-login">
                        Iniciar sesion
                    </Link>
                )}
            </div>
        </nav>
    );
};

const MainApp = () => {
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

const App = () => {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
};

const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const modules = user?.role === 'medico' ? doctorModules : patientModules;

    if (isAuthenticated) {
        return (
            <main className="page-shell">
                <section className="hero-card welcome-hero" aria-labelledby="welcome-title">
                    <p className="eyebrow">Bienvenido de nuevo</p>
                    <h1 id="welcome-title">
                        Hola, {user?.username || 'usuario'}. {user?.role === 'medico' ? 'Tu panel medico esta listo.' : 'Tu portal de salud esta listo.'}
                    </h1>
                    <p className="muted">
                        Continua con citas, triage y seguimiento clinico desde un entorno claro, rapido y seguro.
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
};

const PublicLanding = () => {
    return (
        <main className="page-shell">
            <section className="hero-layout" aria-labelledby="home-title">
                <article className="hero-panel">
                    <p className="eyebrow">Telemedicina · Triaje · Seguimiento</p>
                    <h1 id="home-title" className="hero-title">
                        Atencion medica digital mas rapida, clara y confiable.
                    </h1>
                    <p className="hero-copy">
                        Agenda consultas, recibe orientacion de triage y conserva tu historial clinico en una experiencia disenada para pacientes y equipos medicos modernos.
                    </p>
                    <div className="hero-actions">
                        <Link to="/login" className="cta">Empezar ahora</Link>
                        <Link to="/login" className="ghost-cta">Crear cuenta</Link>
                    </div>
                    <div className="chip-row" aria-label="Beneficios principales">
                        {['Atencion remota', 'Agenda centralizada', 'Datos clinicos seguros'].map((item) => (
                            <span key={item} className="trust-chip">{item}</span>
                        ))}
                    </div>
                </article>

                <aside className="insight-panel" aria-label="Indicadores de plataforma">
                    <img
                        src="https://images.unsplash.com/photo-1581093458791-9d42e87fcf8e?auto=format&fit=crop&w=900&q=82"
                        alt="Profesional de salud revisando una consulta medica digital"
                        loading="lazy"
                        style={{ width: '100%', height: '280px', objectFit: 'cover', borderRadius: '18px', marginBottom: '14px' }}
                    />
                    <div className="metric-grid">
                        {[
                            ['24/7', 'Acceso a orientacion y seguimiento'],
                            ['3 min', 'Tiempo medio para agendar'],
                            ['95%', 'Satisfaccion del usuario'],
                            ['360°', 'Vista clinica del paciente'],
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

            <section className="two-col" aria-label="Confianza y conversion">
                <article className="section-panel">
                    <h2>Por que elegir esta plataforma</h2>
                    <ul>
                        <li>Flujos simples para pacientes y medicos.</li>
                        <li>Integracion visual entre agenda, triage e historial.</li>
                        <li>Interfaz rapida, accesible y optimizada para conversion.</li>
                    </ul>
                </article>

                <article className="section-panel">
                    <h2>Primer paso sin friccion</h2>
                    <ol>
                        <li>Inicia sesion o crea tu cuenta.</li>
                        <li>Accede al modulo que necesitas.</li>
                        <li>Gestiona citas, evaluaciones y seguimiento clinico.</li>
                    </ol>
                </article>
            </section>
        </main>
    );
};

export default App;
