import React, { useState, useEffect } from 'react';
import TriageService from '../services/triage.service';
import PacienteService from '../services/paciente.service';
import { Alert, Button, Input, FormGroup, Spinner, Table } from '../components/UIComponents';

const TriagePage = () => {
    // Modo de identificación de paciente: 'registro' (Ingresar datos nuevos) o 'buscar' (Cargar existente)
    const [tipoIngreso, setTipoIngreso] = useState('registro');
    
    // Datos del paciente (para Autoregistro)
    const [nombre, setNombre] = useState('');
    const [correo, setCorreo] = useState('');
    const [telefono, setTelefono] = useState('');
    const [edad, setEdad] = useState('');
    
    // Búsqueda de paciente existente
    const [searchQuery, setSearchQuery] = useState('');

    // Paciente actualmente identificado
    const [pacienteId, setPacienteId] = useState('');
    const [paciente, setPaciente] = useState(null);

    // Datos del Triage
    const [sintomas, setSintomas] = useState('');
    const [signos_vitales, setSignosVitales] = useState({
        temperatura: '',
        frecuencia_cardiaca: '',
        presion_arterial: '',
        saturacion_oxigeno: '',
    });

    const [resultado, setResultado] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [modo, setModo] = useState('evaluar'); // 'evaluar' | 'historial'

    const validateTriageData = () => {
        const newErrors = {};
        if (!sintomas.trim()) newErrors.sintomas = 'Debe ingresar al menos un síntoma';
        if (!signos_vitales.temperatura) newErrors.temperatura = 'La temperatura es requerida';
        if (!signos_vitales.frecuencia_cardiaca) newErrors.frecuencia_cardiaca = 'La frecuencia cardíaca es requerida';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateRegistrationData = () => {
        const newErrors = {};
        if (!nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!correo.trim()) newErrors.correo = 'El correo electrónico es obligatorio';
        if (!telefono.trim()) newErrors.telefono = 'El teléfono es obligatorio';
        if (!edad) newErrors.edad = 'La edad es obligatoria';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Buscar paciente por correo o teléfono
    const handleBuscarPaciente = async () => {
        if (!searchQuery.trim()) {
            setError('Ingresa un correo, teléfono o nombre para buscar');
            return;
        }

        setLoading(true);
        setError('');
        setPaciente(null);
        setPacienteId('');

        try {
            const data = await PacienteService.buscarPorDocumento(searchQuery.trim());
            if (data) {
                setPaciente(data);
                setPacienteId(data.id);
                setError('');
            }
        } catch (err) {
            console.error("Error al buscar paciente:", err);
            setError('Paciente no encontrado en el microservicio de usuarios.');
        } finally {
            setLoading(false);
        }
    };

    // Procesar evaluación (con registro dinámico si corresponde)
    const handleEvaluar = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});
        setResultado(null);

        // 1. Validar los datos del triage primero
        if (!validateTriageData()) return;

        setLoading(true);

        try {
            let activePacienteId = pacienteId;

            // 2. Si no hay paciente identificado, lo registramos/buscamos según el formulario
            if (!activePacienteId) {
                if (tipoIngreso === 'buscar') {
                    setError('Debes buscar e identificar un paciente primero o usar el formulario de Registro.');
                    setLoading(false);
                    return;
                }

                // Validar datos de registro
                if (!validateRegistrationData()) {
                    setLoading(false);
                    return;
                }

                // Intentar registrar el nuevo paciente
                try {
                    const response = await PacienteService.crear({
                        nombre,
                        correo,
                        telefono,
                        edad: parseInt(edad),
                        contraseña: 'temporal123'
                    });
                    
                    const newPac = response.paciente || response;
                    setPaciente(newPac);
                    setPacienteId(newPac.id);
                    activePacienteId = newPac.id;
                } catch (err) {
                    // Si el correo ya existe, intentamos cargar el paciente existente automáticamente
                    if (err.status === 409 || (typeof err === 'object' && err.error?.includes('ya registrado'))) {
                        try {
                            const data = await PacienteService.buscarPorDocumento(correo);
                            if (data) {
                                setPaciente(data);
                                setPacienteId(data.id);
                                activePacienteId = data.id;
                            }
                        } catch (searchErr) {
                            throw new Error("El correo ya existe, pero no pudimos recuperar la información del paciente.");
                        }
                    } else {
                        throw err;
                    }
                }
            }

            // 3. Proceder con la evaluación de triage
            const sintomas_array = sintomas
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const response = await TriageService.evaluar(activePacienteId, sintomas_array, signos_vitales);

            setResultado(response);
            setError('');
            
            // Cargar automáticamente el historial para ver el nuevo registro si cambia la vista
            cargarHistorial(activePacienteId);
        } catch (err) {
            console.error("Error en la evaluación:", err);
            const errorMsg = typeof err === 'string' ? err : err.error || err.message || 'Error en la evaluación del triage';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const cargarHistorial = async (idToLoad) => {
        const id = idToLoad || pacienteId;
        if (!id) return;
        try {
            const data = await TriageService.obtenerHistorial(id);
            setHistorial(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error al cargar historial:", err);
        }
    };

    const handleCargarHistorial = React.useCallback(async () => {
        if (!pacienteId) {
            setError('Primero identifica a un paciente (registrándolo o buscándolo) para ver su historial');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await cargarHistorial(pacienteId);
        } catch (err) {
            setError(err.message || 'Error al cargar historial');
        } finally {
            setLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pacienteId, cargarHistorial]);

    useEffect(() => {
        if (modo === 'historial') {
            handleCargarHistorial();
        }
    }, [modo, handleCargarHistorial]);

    const limpiarPaciente = () => {
        setPaciente(null);
        setPacienteId('');
        setNombre('');
        setCorreo('');
        setTelefono('');
        setEdad('');
        setSearchQuery('');
        setResultado(null);
        setHistorial([]);
    };

    return (
        <main className="page-shell" style={{ maxWidth: '960px' }}>
            <p className="eyebrow" style={{ color: '#155eef' }}>Módulo Clínico de Triaje</p>
            <h1>Evaluación de Triage</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Clasifica pacientes y prioriza su nivel de urgencia según sus síntomas y signos vitales en tiempo real.
            </p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            {/* Ficha de Identificación del Paciente */}
            <FormGroup>
                <h2>1. Identificación del Paciente</h2>
                
                {paciente ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                        <div>
                            <strong style={{ color: '#047857', display: 'block' }}>Paciente Identificado</strong>
                            <span style={{ fontSize: '0.92rem' }}>
                                <strong>Nombre:</strong> {paciente.nombre || `${paciente.nombres} ${paciente.apellidos}`} | 
                                <strong> Correo:</strong> {paciente.correo} | 
                                <strong> ID:</strong> {paciente.id}
                            </span>
                        </div>
                        <Button variant="secondary" onClick={limpiarPaciente} style={{ minHeight: '36px', padding: '6px 12px' }}>
                            Cambiar Paciente
                        </Button>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '18px', borderBottom: '1px solid rgba(17,24,39,0.08)', paddingBottom: '10px' }}>
                            <button 
                                onClick={() => { setTipoIngreso('registro'); setError(''); }}
                                style={{
                                    background: 'none', border: 'none', 
                                    borderBottom: tipoIngreso === 'registro' ? '2px solid var(--blue)' : '2px solid transparent',
                                    color: tipoIngreso === 'registro' ? 'var(--blue)' : 'var(--muted)',
                                    fontWeight: 'bold', padding: '8px 16px', cursor: 'pointer'
                                }}
                            >
                                Registrar Nuevo Paciente
                            </button>
                            <button 
                                onClick={() => { setTipoIngreso('buscar'); setError(''); }}
                                style={{
                                    background: 'none', border: 'none', 
                                    borderBottom: tipoIngreso === 'buscar' ? '2px solid var(--blue)' : '2px solid transparent',
                                    color: tipoIngreso === 'buscar' ? 'var(--blue)' : 'var(--muted)',
                                    fontWeight: 'bold', padding: '8px 16px', cursor: 'pointer'
                                }}
                            >
                                Buscar Paciente Existente
                            </button>
                        </div>

                        {tipoIngreso === 'registro' ? (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <Input
                                    label="Nombre Completo"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    error={errors.nombre}
                                    placeholder="Nombre del paciente"
                                    required
                                />
                                <Input
                                    label="Correo Electrónico"
                                    type="email"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    error={errors.correo}
                                    placeholder="correo@ejemplo.com"
                                    required
                                />
                                <Input
                                    label="Teléfono"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    error={errors.telefono}
                                    placeholder="Ej: +57 3001234567"
                                    required
                                />
                                <Input
                                    label="Edad"
                                    type="number"
                                    value={edad}
                                    onChange={(e) => setEdad(e.target.value)}
                                    error={errors.edad}
                                    placeholder="Ej: 28"
                                    required
                                />
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                                <Input
                                    label="Buscar Paciente"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Ingresa correo, teléfono o nombre del paciente"
                                />
                                <Button onClick={handleBuscarPaciente} disabled={loading} style={{ marginBottom: '16px' }}>
                                    Buscar y Cargar
                                </Button>
                            </div>
                        )}
                    </>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '16px', borderTop: '1px solid rgba(17,24,39,0.08)', paddingTop: '16px' }}>
                    <Button
                        type="button"
                        onClick={() => setModo('evaluar')}
                        variant={modo === 'evaluar' ? 'primary' : 'secondary'}
                    >
                        Formulario de Triage
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setModo('historial')}
                        variant={modo === 'historial' ? 'primary' : 'secondary'}
                        disabled={!pacienteId}
                    >
                        Historial Médico de Triage
                    </Button>
                </div>
            </FormGroup>

            {modo === 'evaluar' && (
                <FormGroup>
                    <h2>2. Evaluación de Síntomas y Signos Vitales</h2>

                    <form onSubmit={handleEvaluar}>
                        <Input
                            label="Síntomas reportados (separados por comas)"
                            value={sintomas}
                            onChange={(e) => setSintomas(e.target.value)}
                            error={errors.sintomas}
                            placeholder="Ej: dolor de pecho, dificultad para respirar, dolor agudo, desmayo"
                            as="textarea"
                            required
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <Input
                                label="Temperatura (°C)"
                                type="number"
                                step="0.1"
                                value={signos_vitales.temperatura}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, temperatura: e.target.value })}
                                error={errors.temperatura}
                                placeholder="Ej: 36.8"
                                required
                            />
                            <Input
                                label="Frecuencia Cardíaca (lpm)"
                                type="number"
                                value={signos_vitales.frecuencia_cardiaca}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, frecuencia_cardiaca: e.target.value })}
                                error={errors.frecuencia_cardiaca}
                                placeholder="Ej: 72"
                                required
                            />
                            <Input
                                label="Presión Arterial (mmHg)"
                                type="text"
                                value={signos_vitales.presion_arterial}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, presion_arterial: e.target.value })}
                                placeholder="Ej: 120/80"
                            />
                            <Input
                                label="Saturación de Oxígeno (%)"
                                type="number"
                                value={signos_vitales.saturacion_oxigeno}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, saturacion_oxigeno: e.target.value })}
                                placeholder="Ej: 98"
                            />
                        </div>

                        <Button type="submit" disabled={loading} variant="primary" style={{ width: '100%', marginTop: '20px' }}>
                            {loading ? 'Procesando registro y evaluación...' : (pacienteId ? 'Evaluar Triage' : 'Registrar Paciente y Evaluar Triage')}
                        </Button>

                        {loading && <Spinner label="Analizando signos clínicos..." />}
                    </form>

                    {resultado && (
                        <div className="section-panel" style={{ marginTop: '24px', borderLeft: `6px solid ${getNivelColor(resultado.nivel_asignado)}` }}>
                            <h3 style={{ fontSize: '1.2rem', margin: '0 0 16px' }}>Resultado del Análisis Clínico</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div>
                                    <strong>Nivel de Triage Asignado</strong>
                                    <div style={{ fontSize: '1.8rem', color: getNivelColor(resultado.nivel_asignado), fontWeight: 900, marginTop: '4px' }}>
                                        Nivel {resultado.nivel_numero || ''} - {resultado.nivel_asignado}
                                    </div>
                                </div>
                                <div>
                                    <strong>Clasificación de Riesgo</strong>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '8px' }}>{resultado.riesgo_asignado}</div>
                                </div>
                                {resultado.recomendaciones && (
                                    <div style={{ gridColumn: '1 / -1', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                                        <strong>Recomendaciones y Plan de Acción</strong>
                                        <div className="muted" style={{ marginTop: '6px', lineHeight: '1.5' }}>{resultado.recomendaciones}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </FormGroup>
            )}

            {modo === 'historial' && (
                <FormGroup>
                    <h2>Historial de evaluaciones de Triage</h2>
                    {loading ? (
                        <Spinner />
                    ) : historial.length > 0 ? (
                        <Table
                            columns={[
                                { key: 'id_evaluacion', label: 'ID' },
                                { key: 'fecha', label: 'Fecha de Evaluación' },
                                { key: 'nivel_asignado', label: 'Nivel', render: (val) => (
                                    <span style={{ color: getNivelColor(val), fontWeight: 'bold' }}>{val}</span>
                                )},
                                { key: 'riesgo_asignado', label: 'Clasificación de Riesgo' },
                                { key: 'temperatura', label: 'Temp.', render: (val) => `${val}°C` },
                                { key: 'frecuencia_cardiaca', label: 'Frec. Card.', render: (val) => `${val} lpm` },
                            ]}
                            data={historial}
                        />
                    ) : (
                        <Alert type="info" message="No se registran evaluaciones previas para este paciente." />
                    )}
                </FormGroup>
            )}
        </main>
    );
};

const getNivelColor = (nivel) => {
    const colores = {
        RESUCITACION: '#c24135',
        EMERGENCIA: '#ea580c',
        URGENCIA: '#ca8a04',
        SEMIURGENCIA: '#0284c7',
        NO_URGENCIA: '#16803c',
        '1': '#c24135',
        '2': '#ea580c',
        '3': '#ca8a04',
        '4': '#0284c7',
        '5': '#16803c',
    };
    return colores[String(nivel)] || '#0b1220';
};

export default TriagePage;
