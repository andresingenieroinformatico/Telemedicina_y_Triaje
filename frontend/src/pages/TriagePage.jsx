import React, { useState, useEffect } from 'react';
import TriageService from '../services/triage.service';
import PacienteService from '../services/paciente.service';
import { Alert, Button, Input, FormGroup, Spinner, Table } from '../components/UIComponents';

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
    const [modo, setModo] = useState('evaluar');

    const validateForm = () => {
        const newErrors = {};

        if (!pacienteId.trim()) newErrors.pacienteId = 'El ID del paciente es requerido';
        if (!signos_vitales.temperatura) newErrors.temperatura = 'La temperatura es requerida';
        if (!signos_vitales.frecuencia_cardiaca) newErrors.frecuencia_cardiaca = 'La frecuencia cardiaca es requerida';
        if (!sintomas.trim()) newErrors.sintomas = 'Debe ingresar al menos un sintoma';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

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

    const handleEvaluar = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!validateForm()) return;

        setLoading(true);

        try {
            const sintomas_array = sintomas
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s.length > 0);

            const response = await TriageService.evaluar(pacienteId, sintomas_array, signos_vitales);

            setResultado(response);
            setError('');
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error en la evaluacion';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCargarHistorial = React.useCallback(async () => {
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
    }, [pacienteId]);

    useEffect(() => {
        if (modo === 'historial') {
            handleCargarHistorial();
        }
    }, [modo, handleCargarHistorial]);

    return (
        <main className="page-shell" style={{ maxWidth: '960px' }}>
            <p className="eyebrow" style={{ color: '#155eef' }}>Modulo clinico</p>
            <h1>Evaluacion de triage</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Prioriza sintomas y signos vitales con un flujo claro para orientar la atencion medica.
            </p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <FormGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                    <Input
                        label="ID paciente"
                        type="number"
                        value={pacienteId}
                        onChange={(e) => {
                            setPacienteId(e.target.value);
                            setPaciente(null);
                            setResultado(null);
                        }}
                        error={errors.pacienteId}
                        placeholder="Ingrese ID del paciente"
                    />
                    <Button onClick={handleBuscarPaciente} disabled={loading}>
                        Buscar
                    </Button>
                </div>

                {paciente && (
                    <Alert
                        type="success"
                        message={`Paciente encontrado: ${paciente.nombre || 'N/A'}`}
                    />
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                    <Button
                        type="button"
                        onClick={() => setModo('evaluar')}
                        variant={modo === 'evaluar' ? 'primary' : 'secondary'}
                    >
                        Nueva evaluacion
                    </Button>
                    <Button
                        type="button"
                        onClick={() => setModo('historial')}
                        variant={modo === 'historial' ? 'primary' : 'secondary'}
                    >
                        Ver historial
                    </Button>
                </div>
            </FormGroup>

            {modo === 'evaluar' && (
                <FormGroup>
                    <h2>Evaluacion de sintomas y signos vitales</h2>

                    <form onSubmit={handleEvaluar}>
                        <Input
                            label="Sintomas separados por coma"
                            value={sintomas}
                            onChange={(e) => setSintomas(e.target.value)}
                            error={errors.sintomas}
                            placeholder="Ej: dolor de pecho, dificultad para respirar, fiebre"
                            as="textarea"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <Input
                                label="Temperatura (C)"
                                type="number"
                                step="0.1"
                                value={signos_vitales.temperatura}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, temperatura: e.target.value })}
                                error={errors.temperatura}
                                placeholder="36.5"
                            />
                            <Input
                                label="Frecuencia cardiaca (lpm)"
                                type="number"
                                value={signos_vitales.frecuencia_cardiaca}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, frecuencia_cardiaca: e.target.value })}
                                error={errors.frecuencia_cardiaca}
                                placeholder="70"
                            />
                            <Input
                                label="Presion arterial (mmHg)"
                                type="text"
                                value={signos_vitales.presion_arterial}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, presion_arterial: e.target.value })}
                                placeholder="120/80"
                            />
                            <Input
                                label="Saturacion de oxigeno (%)"
                                type="number"
                                value={signos_vitales.saturacion_oxigeno}
                                onChange={(e) => setSignosVitales({ ...signos_vitales, saturacion_oxigeno: e.target.value })}
                                placeholder="98"
                            />
                        </div>

                        <Button type="submit" disabled={loading} variant="primary" style={{ width: '100%', marginTop: '8px' }}>
                            {loading ? 'Evaluando...' : 'Evaluar triage'}
                        </Button>

                        {loading && <Spinner label="Analizando signos vitales..." />}
                    </form>

                    {resultado && (
                        <div className="section-panel" style={{ marginTop: '20px' }}>
                            <h2>Resultado de evaluacion</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                                <div>
                                    <strong>Nivel asignado</strong>
                                    <div style={{ fontSize: '1.6rem', color: getNivelColor(resultado.nivel_asignado), fontWeight: 900 }}>
                                        {resultado.nivel_asignado}
                                    </div>
                                </div>
                                <div>
                                    <strong>Riesgo</strong>
                                    <div>{resultado.riesgo_asignado || 'N/A'}</div>
                                </div>
                                {resultado.recomendaciones && (
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <strong>Recomendaciones</strong>
                                        <div className="muted">{resultado.recomendaciones}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </FormGroup>
            )}

            {modo === 'historial' && (
                <FormGroup>
                    <h2>Historial de evaluaciones</h2>
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
    };
    return colores[nivel] || '#0b1220';
};

export default TriagePage;
