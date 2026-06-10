import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FormGroup } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const modules = [
        {
            id: '01',
            title: 'Agendamiento',
            desc: user?.rol?.toLowerCase() === 'medico' 
                ? 'Gestiona citas, médicos y disponibilidad en tiempo real.' 
                : 'Consulta tus citas programadas y solicita nuevas atenciones.',
            path: '/agendamientos',
            icon: '📅',
            color: '#155eef'
        },
        {
            id: '02',
            title: 'Triaje Médico',
            desc: user?.rol?.toLowerCase() === 'medico' 
                ? 'Evaluación de síntomas y clasificación de niveles de riesgo.' 
                : 'Realiza tu autoevaluación de salud antes de la cita.',
            path: '/triage',
            icon: '🏥',
            color: '#f04438'
        },
        {
            id: '03',
            title: 'Historial Clínico',
            desc: user?.rol?.toLowerCase() === 'medico' 
                ? 'Consulta antecedentes, diagnósticos y evolución del paciente.' 
                : 'Visualiza tus diagnósticos, recetas y evolución clínica.',
            path: '/historial-medico',
            icon: '📋',
            color: '#12b76a'
        },
        {
            id: '04',
            title: 'Videoconferencia',
            desc: user?.rol?.toLowerCase() === 'medico' 
                ? 'Inicia consultas virtuales seguras con tus pacientes.' 
                : 'Accede a tu consulta médica virtual desde casa.',
            path: '/videoconferencia',
            icon: '📹',
            color: '#175cd3'
        },
        {
            id: '05',
            title: user?.rol?.toLowerCase() === 'medico' ? 'Pacientes' : 'Gestión de Usuarios',
            desc: user?.rol?.toLowerCase() === 'medico' 
                ? 'Consulta el directorio de pacientes, datos de contacto y edad.' 
                : 'Administra cuentas, roles y accesos del sistema.',
            path: user?.rol?.toLowerCase() === 'medico' ? '/pacientes' : '/usuarios',
            icon: '👤',
            color: '#667085'
        }
    ];

    // El médico ve los 5 microservicios. El paciente no ve Gestión de Usuarios.
    const visibleModules = modules.filter(m => {
        const rol = user?.rol?.toLowerCase();
        if (rol === 'medico') return true;
        return m.id !== '05';
    });

    return (
        <main className="page-shell">
            <p className="eyebrow" style={{ color: '#155eef' }}>Panel de Control</p>
            <h1>{user?.rol?.toLowerCase() === 'medico' ? 'Panel Médico Central' : 'Mi Portal de Salud'}</h1>
            <p className="muted" style={{ marginBottom: '32px' }}>
                Hola, {user?.nombre || user?.username || 'Usuario'}. Selecciona un microservicio para comenzar.
            </p>

            <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {visibleModules.map((m) => (
                    <FormGroup 
                        key={m.id} 
                        onClick={() => navigate(m.path)}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid #eaecf0' }}
                    >
                        <span className="feature-icon" aria-hidden="true" style={{ background: m.color + '15', color: m.color }}>{m.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                            <span style={{ fontSize: '1.4rem' }}>{m.icon}</span>
                            <strong style={{ fontSize: '1.2rem' }}>{m.title}</strong>
                        </div>
                        <p className="muted" style={{ marginTop: '8px' }}>{m.desc}</p>
                    </FormGroup>
                ))}
            </section>
        </main>
    );
};

export default DashboardPage;