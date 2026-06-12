import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PacienteService from '../services/paciente.service';
import { Alert, Spinner } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import './PacientesPage.css';

const PacientesPage = () => {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        cargarPacientes();
    }, []);

    const cargarPacientes = async () => {
        if (user?.role?.toLowerCase() !== 'medico') {
            setError('Acceso restringido: Solo el personal médico puede ver este directorio.');
            return;
        }

        setLoading(true);
        try {
            const data = await PacienteService.listar();
            setPacientes(data || []);
        } catch (err) {
            setError(err.message || 'Error al conectar con el servicio de pacientes');
        } finally {
            setLoading(false);
        }
    };

    // Filtro en tiempo real
    const pacientesFiltrados = useMemo(() => {
        if (!searchTerm) return pacientes;
        const lowerTerm = searchTerm.toLowerCase();
        return pacientes.filter(p => 
            (p.nombre && p.nombre.toLowerCase().includes(lowerTerm)) ||
            (p.correo && p.correo.toLowerCase().includes(lowerTerm)) ||
            (p.id && p.id.toString().includes(lowerTerm))
        );
    }, [pacientes, searchTerm]);

    // Generador de Avatares Dinámicos
    const getAvatarInfo = (nombre) => {
        if (!nombre) return { initials: '?', color1: '#667085', color2: '#344054' };
        const parts = nombre.trim().split(' ');
        const initials = parts.length > 1 
            ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
            : `${parts[0][0]}${parts[0].length > 1 ? parts[0][1] : ''}`.toUpperCase();
        
        // Colores HSL pseudo-aleatorios basados en el nombre para consistencia
        const charCodeSum = nombre.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        const hue = charCodeSum % 360;
        return {
            initials,
            color1: `hsl(${hue}, 70%, 55%)`,
            color2: `hsl(${(hue + 40) % 360}, 80%, 45%)`
        };
    };

    return (
        <div className="page-shell">
            <div className="pacientes-hero">
                <div className="pacientes-hero-content">
                    <h1>
                        Directorio de Pacientes
                        <span className="pacientes-count">{pacientesFiltrados.length}</span>
                    </h1>
                    <p className="hero-copy">Gestiona tu cartera de pacientes, accede a sus historiales clínicos o agenda nuevas citas rápidamente.</p>
                </div>
                
                <div className="search-container">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="search-input" 
                        placeholder="Buscar por nombre, correo o ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            {error && <Alert type="error" message={error} style={{ marginBottom: '20px' }} />}
            
            {loading ? (
                <Spinner label="Cargando directorio..." />
            ) : pacientesFiltrados.length > 0 ? (
                <div className="pacientes-grid">
                    {pacientesFiltrados.map((paciente) => {
                        const avatar = getAvatarInfo(paciente.nombre);
                        return (
                            <article key={paciente.id} className="paciente-card">
                                <div className="paciente-header">
                                    <div 
                                        className="avatar-gradient"
                                        style={{ background: `linear-gradient(135deg, ${avatar.color1}, ${avatar.color2})` }}
                                    >
                                        {avatar.initials}
                                    </div>
                                    <div className="paciente-info">
                                        <h3>{paciente.nombre}</h3>
                                        <span className="cedula-badge">ID: {paciente.id}</span>
                                    </div>
                                </div>
                                
                                <div className="paciente-details">
                                    <div className="detail-item">
                                        <span className="detail-icon">✉️</span>
                                        <span>{paciente.correo || 'Sin correo'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-icon">📞</span>
                                        <span>{paciente.telefono || 'Sin teléfono'}</span>
                                        {paciente.edad ? (
                                            <span className="age-pill">{paciente.edad} años</span>
                                        ) : (
                                            <span className="age-pill empty-age">Sin edad</span>
                                        )}
                                    </div>
                                </div>

                                <div className="paciente-actions">
                                    <Link to={`/historial-medico?pacienteId=${paciente.id}`} className="action-btn btn-history">
                                        🩺 Historial
                                    </Link>
                                    <Link to={`/agendamientos?pacienteId=${paciente.id}`} className="action-btn btn-appointment">
                                        🗓️ Agendar
                                    </Link>
                                </div>
                            </article>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <h3>No se encontraron pacientes</h3>
                    <p className="muted">Intenta con otros términos de búsqueda o verifica tu conexión.</p>
                </div>
            )}
        </div>
    );
};

export default PacientesPage;