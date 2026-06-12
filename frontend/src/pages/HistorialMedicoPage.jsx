import React, { useEffect, useState } from 'react';
import HistorialMedicoService from '../services/historial-medico.service';
import { Alert, FormGroup, Spinner, Table, Button } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';

const HistorialMedicoPage = () => {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingResumen, setLoadingResumen] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const isMedico = user?.rol?.toLowerCase() === 'medico' || user?.role?.toLowerCase() === 'medico';

    useEffect(() => {
        cargarPacientes();
    }, [user]);

    const cargarPacientes = async () => {
        setLoading(true);
        setError('');
        try {
            if (isMedico) {
                const response = await HistorialMedicoService.listarPacientes();
                const lista = response?.pacientes || response?.items || (Array.isArray(response) ? response : []);
                setPacientes(lista);
                
                if (lista.length > 0) {
                    seleccionarPaciente(lista[0]);
                }
            } else {
                // Si es paciente, obtener su propio resumen
                const idPaciente = user?.paciente_id || user?.id;
                if (idPaciente) {
                    cargarResumen(idPaciente);
                }
            }
        } catch (err) {
            setError(err.message || 'No fue posible cargar la lista de pacientes.');
        } finally {
            setLoading(false);
        }
    };

    const cargarResumen = async (idPaciente) => {
        setLoadingResumen(true);
        setError('');
        try {
            const resumenData = await HistorialMedicoService.obtenerResumenPaciente(idPaciente);
            setResumen(resumenData);
        } catch (err) {
            console.error("Error al cargar resumen:", err);
            setError(err.message || 'No fue posible cargar el resumen clínico del paciente.');
            setResumen(null);
        } finally {
            setLoadingResumen(false);
        }
    };

    const seleccionarPaciente = (paciente) => {
        setPacienteSeleccionado(paciente);
        cargarResumen(paciente.id);
    };

    return (
        <main className="page-shell" style={{ maxWidth: '1200px' }}>
            <section className="hero-card welcome-hero" style={{ marginBottom: '24px' }}>
                <p className="eyebrow" style={{ color: '#155eef' }}>Seguimiento Clínico Integrado</p>
                <h1>Historial Médico y Expediente Electrónico</h1>
                <p className="muted">
                    {isMedico 
                        ? 'Accede de forma segura a los antecedentes, signos vitales y evolución clínica de tus pacientes.' 
                        : 'Consulta tu información clínica, registros vitales y prescripciones médicas.'}
                </p>
            </section>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMedico ? '280px 1fr' : '1fr', 
                gap: '24px',
                alignItems: 'start'
            }}>
                {/* Panel Izquierdo: Lista de Pacientes (Solo Médicos) */}
                {isMedico && (
                    <aside className="insight-panel" style={{ padding: '16px', alignSelf: 'stretch', minHeight: '600px' }}>
                        <h3 style={{ fontSize: '1.1rem', margin: '0 0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Pacientes</span>
                            <span style={{ fontSize: '0.8rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '12px' }}>
                                {pacientes.length}
                            </span>
                        </h3>
                        {loading ? (
                            <Spinner label="Cargando pacientes..." />
                        ) : (
                            <div style={{ display: 'grid', gap: '8px', maxHeight: '550px', overflowY: 'auto', paddingRight: '4px' }}>
                                {pacientes.map((p) => {
                                    const activo = pacienteSeleccionado?.id === p.id;
                                    return (
                                        <button 
                                            key={p.id}
                                            onClick={() => seleccionarPaciente(p)}
                                            style={{
                                                textAlign: 'left',
                                                border: '1px solid ' + (activo ? 'rgba(23, 92, 211, 0.3)' : 'rgba(17, 24, 39, 0.08)'),
                                                background: activo ? 'linear-gradient(135deg, rgba(23, 92, 211, 0.08), rgba(14, 147, 132, 0.04))' : 'white',
                                                padding: '12px 14px',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                                boxShadow: activo ? 'var(--shadow-xs)' : 'none',
                                                position: 'relative'
                                            }}
                                        >
                                            {activo && <div style={{ position: 'absolute', left: 0, top: '20%', bottom: '20%', width: '4px', background: 'var(--blue)', borderRadius: '0 4px 4px 0' }} />}
                                            <strong style={{ display: 'block', fontSize: '0.92rem', color: activo ? 'var(--blue-2)' : 'var(--ink)' }}>{p.nombre || `${p.nombres} ${p.apellidos}`}</strong>
                                            <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>Cédula: {p.cedula || 'N/A'}</span>
                                        </button>
                                    );
                                })}
                                {pacientes.length === 0 && (
                                    <p className="muted" style={{ fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No hay pacientes asignados.</p>
                                )}
                            </div>
                        )}
                    </aside>
                )}

                {/* Panel Derecho: Detalle del Expediente */}
                <section style={{ display: 'grid', gap: '24px' }}>
                    {loadingResumen ? (
                        <div className="section-panel" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <Spinner label="Cargando expediente médico..." />
                        </div>
                    ) : resumen ? (
                        <>
                            {/* Ficha de Información General */}
                            <div className="section-panel" style={{ padding: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                                    <div>
                                        <p className="eyebrow" style={{ color: 'var(--cyan)', margin: '0 0 6px' }}>Ficha de Identificación</p>
                                        <h2 style={{ fontSize: '1.6rem', margin: '0 0 4px', fontWeight: 800 }}>
                                            {resumen.paciente?.nombres || resumen.paciente?.nombre || 'Paciente sin nombre'} {resumen.paciente?.apellidos || ''}
                                        </h2>
                                        <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                                            Cédula: <strong>{resumen.paciente?.cedula || 'N/A'}</strong> | Género: <strong>{resumen.paciente?.genero || 'N/A'}</strong>
                                        </p>
                                    </div>
                                    <span style={{ 
                                        padding: '6px 12px', 
                                        background: '#ecfdf5', 
                                        color: '#047857', 
                                        borderRadius: '30px', 
                                        fontSize: '0.82rem', 
                                        fontWeight: 'bold',
                                        border: '1px solid #a7f3d0'
                                    }}>
                                        Tipo Sangre: {resumen.paciente?.tipo_sangre || 'N/A'}
                                    </span>
                                </div>

                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '16px', 
                                    marginTop: '20px',
                                    paddingTop: '20px',
                                    borderTop: '1px solid #f1f5f9'
                                }}>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Correo Electrónico</span>
                                        <strong style={{ fontSize: '0.9rem' }}>{resumen.paciente?.correo || resumen.paciente?.email || 'N/A'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Teléfono de Contacto</span>
                                        <strong style={{ fontSize: '0.9rem' }}>{resumen.paciente?.telefono || 'N/A'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Fecha de Nacimiento</span>
                                        <strong style={{ fontSize: '0.9rem' }}>{resumen.paciente?.fecha_nacimiento || 'N/A'}</strong>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted)', display: 'block' }}>Dirección</span>
                                        <strong style={{ fontSize: '0.9rem' }}>{resumen.paciente?.direccion || 'N/A'}</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Antecedentes Clínicos */}
                            <div className="section-panel" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    Antecedentes Clínicos del Paciente
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>⚠️ Alergias conocidas</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#7f1d1d' }}>{resumen.historial?.alergias || 'Ninguna reportada.'}</p>
                                    </div>
                                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#92400e', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>🩺 Enfermedades crónicas</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#78350f' }}>{resumen.historial?.enfermedades_cronicas || 'Ninguna diagnosticada.'}</p>
                                    </div>
                                    <div style={{ background: '#f0fdfa', border: '1px solid #ccfbf1', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#0f766e', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>💊 Medicamentos actuales</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#115e59' }}>{resumen.historial?.medicamentos_actuales || 'Ninguno reportado.'}</p>
                                    </div>
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#334155', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>🩹 Cirugías previas</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{resumen.historial?.cirugias_previas || 'Ninguna registrada.'}</p>
                                    </div>
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#334155', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>🚶 Hábitos personales</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{resumen.historial?.habitos || 'No especificados.'}</p>
                                    </div>
                                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '8px' }}>
                                        <strong style={{ color: '#334155', fontSize: '0.9rem', display: 'block', marginBottom: '4px' }}>👪 Antecedentes familiares</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem', color: '#475569' }}>{resumen.historial?.antecedentes_familiares || 'Ninguno relevante.'}</p>
                                    </div>
                                </div>
                                {resumen.historial?.observaciones && (
                                    <div style={{ marginTop: '20px', padding: '12px 16px', background: '#f1f5f9', borderRadius: '8px', borderLeft: '4px solid #64748b' }}>
                                        <strong style={{ fontSize: '0.86rem', display: 'block', marginBottom: '2px' }}>Observaciones Generales</strong>
                                        <p style={{ margin: 0, fontSize: '0.88rem' }}>{resumen.historial.observaciones}</p>
                                    </div>
                                )}
                            </div>

                            {/* Signos Vitales Recientes */}
                            <div className="section-panel" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    Lectura de Signos Vitales Recientes
                                </h3>
                                {resumen.ultimos_signos && resumen.ultimos_signos.length > 0 ? (
                                    <Table 
                                        columns={[
                                            { 
                                                key: 'registrado_en', 
                                                label: 'Fecha Registro',
                                                render: (val) => new Date(val).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                                            },
                                            { key: 'temperatura', label: 'T° (C)', render: (val) => `${val}°C` },
                                            { key: 'frecuencia_cardiaca', label: 'FC (lpm)', render: (val) => `${val} lpm` },
                                            { key: 'presion_arterial', label: 'Presión Art.', render: (val) => val || 'N/A' },
                                            { key: 'saturacion_oxigeno', label: 'SpO2 (%)', render: (val) => val ? `${val}%` : 'N/A' },
                                            { key: 'peso', label: 'Peso', render: (val) => val ? `${val} kg` : 'N/A' },
                                            { key: 'estatura', label: 'Estatura', render: (val) => val ? `${val} m` : 'N/A' },
                                        ]}
                                        data={resumen.ultimos_signos}
                                    />
                                ) : (
                                    <Alert type="warning" message="No se han registrado lecturas de signos vitales para este paciente." />
                                )}
                            </div>

                            {/* Consultas y Evoluciones */}
                            <div className="section-panel" style={{ padding: '24px' }}>
                                <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                                    Historial de Consultas Médicas y Evolución
                                </h3>
                                {resumen.ultimas_consultas && resumen.ultimas_consultas.length > 0 ? (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {resumen.ultimas_consultas.map((c, idx) => (
                                            <div 
                                                key={c.id || idx} 
                                                style={{ 
                                                    border: '1px solid rgba(17, 24, 39, 0.08)', 
                                                    borderRadius: '12px', 
                                                    padding: '18px',
                                                    background: 'white',
                                                    boxShadow: 'var(--shadow-xs)'
                                                }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '12px' }}>
                                                    <strong>Motivo: {c.motivo}</strong>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                                                        {new Date(c.fecha_consulta).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                                    <div>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Diagnóstico</span>
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', fontWeight: 500 }}>{c.diagnostico}</p>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Tratamiento / Receta</span>
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: 'var(--blue-2)' }}>{c.tratamiento}</p>
                                                    </div>
                                                </div>
                                                {c.observaciones && (
                                                    <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px dotted #e2e8f0' }}>
                                                        <span style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'block' }}>Observaciones de la Consulta</span>
                                                        <p style={{ margin: '4px 0 0', fontSize: '0.84rem', color: '#475569' }}>{c.observaciones}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Alert type="warning" message="No se han registrado consultas ni notas evolutivas previas para este paciente." />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="section-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📋</div>
                            <h3>Sin Expediente Seleccionado</h3>
                            <p className="muted">Selecciona un paciente del menú lateral para cargar su historial clínico.</p>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
};

export default HistorialMedicoPage;
