import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Alert, Button, FormGroup, Input, Spinner } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import VideoconferenciaService from '../services/videoconferencia.service';
import AgendamientoService from '../services/agendamiento.service';

const VideoconferenciaPage = () => {
    const location = useLocation();
    const { user } = useAuth();
    const queryParams = new URLSearchParams(location.search);
    const citaId = queryParams.get('citaId');

    const [cita, setCita] = useState(null);
    const [customRoomName, setCustomRoomName] = useState('');
    const [jitsiLoaded, setJitsiLoaded] = useState(false);
    const [jitsiAPI, setJitsiAPI] = useState(null);
    const [isInRoom, setIsInRoom] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const containerRef = useRef(null);

    // Cargar datos de la cita vinculada
    useEffect(() => {
        const cargarDatosCita = async () => {
            if (!citaId) return;
            try {
                const data = await AgendamientoService.obtener(citaId);
                setCita(data.data || data);
            } catch (err) {
                console.error("Error al obtener detalles de la cita:", err);
            }
        };
        cargarDatosCita();
    }, [citaId]);

    // Ya no cargamos el external_api.js para evitar el límite de 5 minutos de Jitsi
    useEffect(() => {
        setJitsiLoaded(true);
    }, []);

    const handleJoin = async () => {
        if (!jitsiLoaded) {
            setError("Jitsi Meet aún se está cargando. Por favor, espera un momento.");
            return;
        }
        setError('');

        let roomName = '';
        if (citaId) {
            roomName = `consulta-cita-${citaId}`;
        } else {
            if (!customRoomName.trim()) {
                setError("Por favor, ingresa un nombre o código de sala para unirte.");
                return;
            }
            // Formatear el nombre de la sala para que sea seguro para Jitsi
            roomName = customRoomName
                .trim()
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
                .replace(/[^a-z0-9]/g, '-'); // Reemplazar caracteres especiales por guiones
        }

        setLoading(true);

        try {
            const userRole = user?.rol || user?.role || 'paciente';
            const displayName = user?.nombre || user?.username || 'Usuario';
            const userId = user?.id || 1;

            // Petición al backend para unirse/crear la sala y obtener la configuración
            const response = await VideoconferenciaService.unirseSala(
                roomName,
                userId,
                userRole,
                citaId || 1, // sala_id fallback
                displayName
            );

            if (response.success && response.data) {
                if (containerRef.current) {
                    // Abrir la sala directamente en una nueva pestaña (bypass al límite de 5 minutos)
                    window.open(response.data.url_acceso, '_blank', 'noopener,noreferrer');
                    
                    // Guardar la URL en el estado (usamos jitsiAPI temporalmente para esto o creamos una variable nueva)
                    setJitsiAPI({ url: response.data.url_acceso });
                    setIsInRoom(true);
                }
            } else {
                setError("El servidor de videoconferencia devolvió un formato no válido.");
            }
        } catch (err) {
            console.error("Error al iniciar videollamada:", err);
            setError(err.error || err.message || "Error al conectar con el microservicio de videoconferencia.");
        } finally {
            setLoading(false);
        }
    };

    const handleEndCall = () => {
        setJitsiAPI(null);
        setIsInRoom(false);
    };

    return (
        <main className="page-shell">
            <section className="hero-card welcome-hero" style={{ marginBottom: '24px' }}>
                <p className="eyebrow" style={{ color: '#175cd3' }}>Sala Virtual de Consulta</p>
                <h1 id="video-title">Videoconferencia Médica</h1>
                <p className="muted">
                    {isInRoom ? "Consulta activa. Los flujos de audio y video están protegidos." : "Accede a tu teleconsulta médica integrada de forma segura o únete a una sala personalizada."}
                </p>
            </section>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <section className="feature-grid" style={{ gridTemplateColumns: isInRoom ? '1fr' : 'repeat(3, 1fr)' }}>
                <article className="feature-card" style={{ gridColumn: isInRoom ? '1 / -1' : 'span 2' }}>
                    <div 
                        style={{ 
                            background: '#0f172a', 
                            borderRadius: '16px', 
                            height: '550px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            flexDirection: 'column',
                            color: 'white',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}
                    >
                        <div ref={containerRef} style={{ width: '100%', height: '100%', display: isInRoom ? 'block' : 'none' }}></div>
                        
                        {isInRoom && (
                            <div style={{ textAlign: 'center', padding: '20px', width: '100%', maxWidth: '440px' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px' }}>🟢</div>
                                <h3 style={{ color: 'white', margin: '0 0 8px' }}>Consulta en Curso</h3>
                                <p style={{ color: '#94a3b8', margin: '0 auto 24px' }}>
                                    La videollamada ha sido abierta en una ventana segura sin límite de tiempo.
                                </p>
                                <Button variant="primary" onClick={() => window.open(jitsiAPI?.url, '_blank')} style={{ marginBottom: '12px' }}>
                                    Reabrir Ventana de Jitsi
                                </Button>
                                <br />
                                <Button variant="danger" onClick={handleEndCall}>
                                    Finalizar y Salir de la Consulta
                                </Button>
                            </div>
                        )}
                        
                        {!isInRoom && (
                            <div style={{ textAlign: 'center', padding: '20px', width: '100%', maxWidth: '440px', position: 'absolute' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px', animation: 'spin 4s linear infinite' }}>🌐</div>
                                <h3 style={{ color: 'white', margin: '0 0 8px' }}>Sala de Videollamada</h3>
                                
                                {citaId ? (
                                    <>
                                        <p style={{ color: '#94a3b8', margin: '0 auto 24px' }}>
                                            Conexión lista para la cita médica vinculada ID: <strong>{citaId}</strong>.
                                        </p>
                                        {loading ? (
                                            <Spinner label="Cargando configuración de videoconferencia..." />
                                        ) : (
                                            <Button variant="primary" onClick={handleJoin} disabled={!jitsiLoaded}>
                                                {jitsiLoaded ? 'Iniciar Consulta' : 'Cargando Módulos...'}
                                            </Button>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <p style={{ color: '#94a3b8', margin: '0 auto 20px', fontSize: '0.92rem' }}>
                                            Ingresa el nombre o código de la sala a la que deseas unirte (ej: consulta-privada).
                                        </p>
                                        <div style={{ marginBottom: '16px', textAlign: 'left' }}>
                                            <Input
                                                label="Código o Nombre de Sala"
                                                type="text"
                                                value={customRoomName}
                                                onChange={(e) => setCustomRoomName(e.target.value)}
                                                placeholder="Ejemplo: sala-de-consulta"
                                                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                                            />
                                        </div>
                                        {loading ? (
                                            <Spinner label="Conectando..." />
                                        ) : (
                                            <Button variant="primary" onClick={handleJoin} disabled={!jitsiLoaded} style={{ width: '100%' }}>
                                                {jitsiLoaded ? 'Unirse a la Sala' : 'Cargando Módulos...'}
                                            </Button>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </article>

                {!isInRoom && (
                    <aside className="insight-panel">
                        <h3>Acceso a Consultas</h3>
                        <FormGroup>
                            <Alert type="info" message="Puedes unirte directamente ingresando un código compartido por tu médico o paciente." />
                            <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                                <div className="section-panel" style={{ padding: '16px', background: '#f8fafc', margin: 0 }}>
                                    <strong style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Detalles de la Conexión</strong>
                                    {citaId && cita ? (
                                        <>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Cita ID:</strong> {cita.id}</p>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Fecha:</strong> {cita.fecha_cita}</p>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Hora:</strong> {cita.hora_cita}</p>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Médico:</strong> {cita.medico_nombre || `ID: ${cita.medico_id}`}</p>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Paciente:</strong> {cita.paciente_nombre || `ID: ${cita.paciente_id}`}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}><strong>Modo:</strong> Sala Libre / Manual</p>
                                            <p className="muted" style={{ fontSize: '12px', marginTop: '10px', lineHeight: '1.4' }}>
                                                Para iniciar una llamada vinculada a tu agenda, ve a la sección de <Link to="/agendamientos" style={{ color: 'var(--blue)', fontWeight: 'bold' }}>Agenda Médica</Link> y haz clic en "Videoconferencia" sobre la cita programada.
                                            </p>
                                        </>
                                    )}
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                                <div className="section-panel" style={{ padding: '16px', background: '#f0fdf4', margin: 0, border: '1px solid #bbf7d0' }}>
                                    <strong style={{ fontSize: '14px', display: 'block', color: '#166534', marginBottom: '4px' }}>🔒 Encriptación WebRTC</strong>
                                    <p className="muted" style={{ fontSize: '12px', margin: 0, color: '#166534', lineHeight: '1.4' }}>
                                        La videoconferencia se ejecuta de forma segura punto a punto. Recuerda habilitar los permisos del micrófono y la cámara en el navegador.
                                    </p>
                                </div>
                            </div>
                        </FormGroup>
                    </aside>
                )}
            </section>


        </main>
    );
};

export default VideoconferenciaPage;