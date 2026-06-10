import React from 'react';
import { Alert, Button, FormGroup } from '../components/UIComponents';

const VideoconferenciaPage = () => {
    return (
        <main className="page-shell">
            <section className="hero-card welcome-hero" aria-labelledby="video-title">
                <p className="eyebrow" style={{ color: '#175cd3' }}>Sala Virtual de Consulta</p>
                <h1 id="video-title">Videoconferencia Médica</h1>
                <p className="muted">
                    Inicia sesiones seguras de telemedicina para evaluación y seguimiento clínico en tiempo real.
                </p>
            </section>

            <section className="feature-grid">
                <article className="feature-card" style={{ gridColumn: 'span 2' }}>
                    <div style={{ 
                        background: '#1e293b', 
                        borderRadius: '16px', 
                        height: '450px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        flexDirection: 'column',
                        color: 'white'
                    }}>
                        <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.5 }}>📹</div>
                        <h3 style={{ color: 'white' }}>Cámara desactivada</h3>
                        <p style={{ color: '#94a3b8' }}>Listo para iniciar la sesión clínica</p>
                        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                            <Button variant="primary">Iniciar Cámara</Button>
                            <Button variant="secondary">Entrar a la Sala</Button>
                        </div>
                    </div>
                </article>

                <aside className="insight-panel">
                    <h3>Panel de Control</h3>
                    <FormGroup>
                        <Alert type="info" message="Verifica que el paciente esté conectado antes de iniciar la consulta virtual." />
                        <div style={{ display: 'grid', gap: '12px' }}>
                            <Button variant="secondary" style={{ width: '100%' }}>Compartir Pantalla</Button>
                            <Button variant="secondary" style={{ width: '100%' }}>Chat de Consulta</Button>
                            <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                            <Button variant="danger" style={{ width: '100%' }}>Finalizar Llamada</Button>
                        </div>
                    </FormGroup>
                </aside>
            </section>
        </main>
    );
};

export default VideoconferenciaPage;