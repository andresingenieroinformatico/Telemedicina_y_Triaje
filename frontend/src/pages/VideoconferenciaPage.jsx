import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, FormGroup } from '../components/UIComponents';

const VideoconferenciaPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const citaId = queryParams.get('citaId');

    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isInRoom, setIsInRoom] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    const toggleCamera = () => setIsCameraOn(!isCameraOn);
    const toggleMute = () => setIsMuted(!isMuted);
    const handleJoin = () => setIsInRoom(true);
    const handleEndCall = () => {
        setIsInRoom(false);
        setIsCameraOn(false);
    };

    useEffect(() => {
        if (!citaId) {
            // Si intentan entrar sin una cita vinculada, redirigimos
            navigate('/agendamientos');
        }
    }, [citaId, navigate]);

    return (
        <main className="page-shell">
            <section className="hero-card welcome-hero" aria-labelledby="video-title">
                <p className="eyebrow" style={{ color: '#175cd3' }}>Sala Virtual de Consulta</p>
                <h1 id="video-title">Videoconferencia Médica</h1>
                <p className="muted">
                    {isInRoom ? "Consulta activa. El audio y video están encriptados." : "Inicia sesiones seguras de telemedicina para evaluación y seguimiento clínico en tiempo real."}
                </p>
            </section>

            <section className="feature-grid">
                <article className="feature-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ 
                        background: '#0f172a', 
                        borderRadius: '16px', 
                        height: '500px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexDirection: 'column',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
                    }}>
                        {!isCameraOn ? (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>📹</div>
                                <h3 style={{ color: 'white', margin: '0 0 8px' }}>Cámara desactivada</h3>
                                <p style={{ color: '#94a3b8' }}>Configura tus dispositivos antes de entrar</p>
                            </div>
                        ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '80px', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.2))' }}>👤</div>
                                    <p style={{ marginTop: '16px', fontWeight: '500' }}>Esperando al paciente...</p>
                                </div>
                                {/* Preview Local */}
                                <div style={{ 
                                    position: 'absolute', 
                                    bottom: '20px', 
                                    right: '20px', 
                                    width: '160px', 
                                    height: '100px', 
                                    background: '#1e293b', 
                                    borderRadius: '12px', 
                                    border: '2px solid #334155',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '11px'
                                }}>
                                    Vista previa (Tú)
                                </div>
                            </div>
                        )}
                        
                        <div style={{ position: 'absolute', bottom: '30px', display: 'flex', gap: '12px', zIndex: 10 }}>
                            {!isInRoom ? (
                                <>
                                    <Button variant="secondary" onClick={toggleCamera}>
                                        {isCameraOn ? 'Desactivar Cámara' : 'Probar Cámara'}
                                    </Button>
                                    <Button variant="primary" onClick={handleJoin}>Iniciar Sesión</Button>
                                </>
                            ) : (
                                <div style={{ 
                                    background: 'rgba(30, 41, 59, 0.8)', 
                                    padding: '8px 20px', 
                                    borderRadius: '40px', 
                                    display: 'flex', 
                                    gap: '20px',
                                    backdropFilter: 'blur(8px)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                    <button onClick={toggleMute} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                                        {isMuted ? '🔇' : '🎤'}
                                    </button>
                                    <button onClick={toggleCamera} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer' }}>
                                        {isCameraOn ? '📹' : '🚫'}
                                    </button>
                                    <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 5px' }} />
                                    <button onClick={handleEndCall} style={{ background: '#ef4444', border: 'none', color: 'white', padding: '8px 24px', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Terminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </article>

                <aside className="insight-panel">
                    <h3>Panel de Control</h3>
                    <FormGroup>
                        {isInRoom ? (
                            <Alert type="success" message="Consulta en progreso." />
                        ) : (
                            <Alert type="info" message="Verifica que el paciente esté conectado antes de iniciar la consulta virtual." />
                        )}
                        <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                            <Button variant="secondary" style={{ width: '100%' }}>Compartir Pantalla</Button>
                            <Button variant="secondary" style={{ width: '100%' }}>Chat de Consulta</Button>
                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                            <div className="section-panel" style={{ padding: '12px', background: '#f8fafc' }}>
                                <strong style={{ fontSize: '14px' }}>Detalles de la sesión</strong>
                                <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}>Estado: {isInRoom ? 'Conectado' : 'Esperando'}</p>
                                <p className="muted" style={{ fontSize: '13px', margin: '4px 0' }}>Encriptación: AES-256</p>
                            </div>
                        </div>
                    </FormGroup>
                </aside>
            </section>
        </main>
    );
};

export default VideoconferenciaPage;