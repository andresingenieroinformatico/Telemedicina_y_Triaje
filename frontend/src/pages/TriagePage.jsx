import React, { useState, useEffect } from 'react';
import TriageService from '../services/triage.service';
import PacienteService from '../services/paciente.service';
import { Alert, Button, Input, FormGroup, Spinner, Table } from '../components/UIComponents';

/**
 * Página de Triaje - Evaluación de pacientes
 */
const TriagePage = () => {
    const [pacienteId, setPacienteId] = useState('');
    const [paciente, setPaciente] = useState(null);
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
    const [modo, setModo] = useState('evaluar'); // 'evaluar' o 'historial'

    // Validaciones
    const validateForm = () => {
        const newErrors = {};

        if (!pacienteId.trim()) {
            newErrors.pacienteId = 'El ID del paciente es requerido';
        }
        if (!signos_vitales.temperatura) {
            newErrors.temperatura = 'La temperatura es requerida';
        }
        if (!signos_vitales.frecuencia_cardiaca) {
            newErrors.frecuencia_cardiaca = 'La frecuencia cardíaca es requerida';
        }
        if (!sintomas.trim()) {
            newErrors.sintomas = 'Debe ingresar al menos un síntoma';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Buscar paciente
    const handleBuscarPaciente = async () => {
        if (!pacienteId.trim()) {
            setError('Ingrese un ID de paciente');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await PacienteService.obtener(pacienteId);
            setPaciente(data);
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al buscar paciente';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Realizar evaluación
    const handleEvaluar = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const sintomas_array = sintomas
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const response = await TriageService.evaluar(
                pacienteId,
                sintomas_array,
                signos_vitales
            );

            setResultado(response);
            setError('');
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error en la evaluación';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Cargar historial
    const handleCargarHistorial = async () => {
        if (!pacienteId.trim()) {
            setError('Ingrese un ID de paciente');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await TriageService.obtenerHistorial(pacienteId);
            setHistorial(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al cargar historial';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (modo === 'historial') {
            handleCargarHistorial();
        }
    }, [modo]);

    return (
        <div style={{ maxWidth: '900px', margin: '20px auto', padding: '20px' }}>
            <h1>📋 Evaluación de Triaje</h1>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <FormGroup style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <Input
                        label="ID Paciente"
                        type="number"
                        value={pacienteId}
                        onChange={(e) => {
                            setPacienteId(e.target.value);
                            setPaciente(null);
                            setResultado(null);
                        }}
                        error={errors.pacienteId}
                        placeholder="Ingrese ID del paciente"
                        style={{ flex: 1 }}
                    />
                    <div style={{ alignSelf: 'flex-end', marginBottom: '0px' }}>
                        <Button onClick={handleBuscarPaciente} disabled={loading}>
                            Buscar
                        </Button>
                    </div>
                </div>

                {paciente && (
                    <Alert
                        type="success"
                        message={`✓ Paciente encontrado: ${paciente.nombre || 'N/A'}`}
                    />
                )}

                <div style={{ marginBottom: '20px' }}>
                    <button
                        onClick={() => setModo('evaluar')}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: modo === 'evaluar' ? '#007bff' : '#e9ecef',
                            color: modo === 'evaluar' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            marginRight: '10px',
                            cursor: 'pointer',
                        }}
                    >
                        Nueva Evaluación
                    </button>
                    <button
                        onClick={() => setModo('historial')}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: modo === 'historial' ? '#007bff' : '#e9ecef',
                            color: modo === 'historial' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        Ver Historial
                    </button>
                </div>
            </FormGroup>

            {modo === 'evaluar' && (
                <FormGroup>
                    <h2>Evaluación de Síntomas y Signos Vitales</h2>

                    <form onSubmit={handleEvaluar}>
                        <Input
                            label="Síntomas (separados por coma)"
                            value={sintomas}
                            onChange={(e) => setSintomas(e.target.value)}
                            error={errors.sintomas}
                            placeholder="ej: dolor de pecho, dificultad para respirar, fiebre"
                            as="textarea"
                        />

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '15px',
                            }}
                        >
                            <Input
                                label="Temperatura (°C)"
                                type="number"
                                step="0.1"
                                value={signos_vitales.temperatura}
                                onChange={(e) =>
                                    setSignosVitales({
                                        ...signos_vitales,
                                        temperatura: e.target.value,
                                    })
                                }
                                error={errors.temperatura}
                                placeholder="36.5"
                            />

                            <Input
                                label="Frecuencia Cardíaca (lpm)"
                                type="number"
                                value={signos_vitales.frecuencia_cardiaca}
                                onChange={(e) =>
                                    setSignosVitales({
                                        ...signos_vitales,
                                        frecuencia_cardiaca: e.target.value,
                                    })
                                }
                                error={errors.frecuencia_cardiaca}
                                placeholder="70"
                            />

                            <Input
                                label="Presión Arterial (mmHg)"
                                type="text"
                                value={signos_vitales.presion_arterial}
                                onChange={(e) =>
                                    setSignosVitales({
                                        ...signos_vitales,
                                        presion_arterial: e.target.value,
                                    })
                                }
                                placeholder="120/80"
                            />

                            <Input
                                label="Saturación de Oxígeno (%)"
                                type="number"
                                value={signos_vitales.saturacion_oxigeno}
                                onChange={(e) =>
                                    setSignosVitales({
                                        ...signos_vitales,
                                        saturacion_oxigeno: e.target.value,
                                    })
                                }
                                placeholder="98"
                            />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <Button
                                type="submit"
                                disabled={loading}
                                variant="primary"
                                style={{ width: '100%' }}
                            >
                                {loading ? 'Evaluando...' : 'Evaluar Triaje'}
                            </Button>
                        </div>

                        {loading && <Spinner />}
                    </form>

                    {resultado && (
                        <div
                            style={{
                                marginTop: '20px',
                                padding: '20px',
                                backgroundColor: '#d4edda',
                                border: '1px solid #c3e6cb',
                                borderRadius: '4px',
                            }}
                        >
                            <h2>✓ Resultado de Evaluación</h2>
                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(2, 1fr)',
                                    gap: '15px',
                                }}
                            >
                                <div>
                                    <strong>Nivel Asignado:</strong>
                                    <div
                                        style={{
                                            fontSize: '24px',
                                            color: getNivelColor(resultado.nivel_asignado),
                                            fontWeight: 'bold',
                                        }}
                                    >
                                        {resultado.nivel_asignado}
                                    </div>
                                </div>
                                <div>
                                    <strong>Riesgo:</strong>
                                    <div>{resultado.riesgo_asignado || 'N/A'}</div>
                                </div>
                                {resultado.recomendaciones && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong>Recomendaciones:</strong>
                                        <div>{resultado.recomendaciones}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </FormGroup>
            )}

            {modo === 'historial' && (
                <FormGroup>
                    <h2>Historial de Evaluaciones</h2>

                    {loading ? (
                        <Spinner />
                    ) : historial.length > 0 ? (
                        <Table
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'fecha', label: 'Fecha' },
                                { key: 'nivel_asignado', label: 'Nivel' },
                                { key: 'riesgo_asignado', label: 'Riesgo' },
                            ]}
                            data={historial}
                        />
                    ) : (
                        <Alert type="info" message="No hay historial de evaluaciones" />
                    )}
                </FormGroup>
            )}
        </div>
    );
};

// Función auxiliar para determinar el color según el nivel de triaje
const getNivelColor = (nivel) => {
    const colores = {
        RESUCITACION: '#dc3545',
        EMERGENCIA: '#fd7e14',
        URGENCIA: '#ffc107',
        SEMIURGENCIA: '#0dcaf0',
        NO_URGENCIA: '#198754',
    };
    return colores[nivel] || '#333';
};

export default TriagePage;
