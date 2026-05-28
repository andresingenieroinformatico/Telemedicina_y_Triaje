import React, { useState, useEffect } from 'react';
import AgendamientoService from '../services/agendamiento.service';
import MedicoService from '../services/medico.service';
import PacienteService from '../services/paciente.service';
import EspecialidadService from '../services/especialidad.service';
import { Alert, Button, Input, Select, FormGroup, Spinner, Table } from '../components/UIComponents';

/**
 * Página de Agendamiento - Gestión de citas
 */
const AgendamientoPage = () => {
    const [tab, setTab] = useState('listar'); // 'listar', 'crear'
    const [agendamientos, setAgendamientos] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});

    // Filtros
    const [filtros, setFiltros] = useState({
        paciente_id: '',
        medico_id: '',
        estado: '',
    });

    // Formulario de crear agendamiento
    const [formAgendamiento, setFormAgendamiento] = useState({
        paciente_id: '',
        medico_id: '',
        especialidad_id: '',
        fecha_cita: '',
        hora_cita: '',
        motivo: '',
    });

    // Cargar datos iniciales
    useEffect(() => {
        cargarEspecialidades();
        cargarMedicos();
        cargarPacientes();
    }, []);

    // Cargar agendamientos cuando cambia la tab
    useEffect(() => {
        if (tab === 'listar') {
            cargarAgendamientos();
        }
    }, [tab]);

    const cargarAgendamientos = async () => {
        setLoading(true);
        setError('');

        try {
            const params = {};
            if (filtros.paciente_id) params.paciente_id = filtros.paciente_id;
            if (filtros.medico_id) params.medico_id = filtros.medico_id;
            if (filtros.estado) params.estado = filtros.estado;

            const data = await AgendamientoService.listar(params);
            setAgendamientos(Array.isArray(data) ? data : []);
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al cargar agendamientos';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const cargarMedicos = async () => {
        try {
            const data = await MedicoService.listar();
            setMedicos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar médicos:', err);
        }
    };

    const cargarPacientes = async () => {
        try {
            const data = await PacienteService.listar();
            setPacientes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar pacientes:', err);
        }
    };

    const cargarEspecialidades = async () => {
        try {
            const data = await EspecialidadService.listar();
            setEspecialidades(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar especialidades:', err);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formAgendamiento.paciente_id) {
            newErrors.paciente_id = 'El paciente es requerido';
        }
        if (!formAgendamiento.medico_id) {
            newErrors.medico_id = 'El médico es requerido';
        }
        if (!formAgendamiento.fecha_cita) {
            newErrors.fecha_cita = 'La fecha es requerida';
        }
        if (!formAgendamiento.hora_cita) {
            newErrors.hora_cita = 'La hora es requerida';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCrearAgendamiento = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const payload = {
                paciente_id: parseInt(formAgendamiento.paciente_id),
                medico_id: parseInt(formAgendamiento.medico_id),
                fecha_cita: formAgendamiento.fecha_cita,
                hora_cita: formAgendamiento.hora_cita,
                motivo: formAgendamiento.motivo || 'Consulta médica',
            };

            await AgendamientoService.crear(payload);

            // Limpiar formulario
            setFormAgendamiento({
                paciente_id: '',
                medico_id: '',
                especialidad_id: '',
                fecha_cita: '',
                hora_cita: '',
                motivo: '',
            });

            setTab('listar');
            await cargarAgendamientos();
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al crear agendamiento';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelarAgendamiento = async (id) => {
        if (!window.confirm('¿Está seguro de que desea cancelar este agendamiento?')) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            await AgendamientoService.cancelar(id, 'Cancelado por usuario');
            await cargarAgendamientos();
        } catch (err) {
            const errorMsg = typeof err === 'string' ? err : err.message || 'Error al cancelar';
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const estadoOptions = [
        { label: 'Todos', value: '' },
        { label: 'Pendiente', value: 'PENDIENTE' },
        { label: 'Confirmada', value: 'CONFIRMADA' },
        { label: 'En Curso', value: 'EN_CURSO' },
        { label: 'Completada', value: 'COMPLETADA' },
        { label: 'Cancelada', value: 'CANCELADA' },
    ];

    const medicoOptions = medicos.map((m) => ({
        label: `${m.nombre || m.nombre_usuario} - ${m.especialidad || 'N/A'}`,
        value: m.id,
    }));

    const pacienteOptions = pacientes.map((p) => ({
        label: `${p.nombre || p.nombre_usuario} (${p.numero_documento || 'N/A'})`,
        value: p.id,
    }));

    const especialidadOptions = especialidades.map((e) => ({
        label: e.nombre || e.nombre_especialidad,
        value: e.id,
    }));

    return (
        <div style={{ maxWidth: '1000px', margin: '20px auto', padding: '20px' }}>
            <h1>📅 Gestión de Agendamientos</h1>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <FormGroup style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <button
                        onClick={() => setTab('listar')}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: tab === 'listar' ? '#007bff' : '#e9ecef',
                            color: tab === 'listar' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        📋 Listar Agendamientos
                    </button>
                    <button
                        onClick={() => setTab('crear')}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: tab === 'crear' ? '#007bff' : '#e9ecef',
                            color: tab === 'crear' ? 'white' : '#333',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                        }}
                    >
                        ➕ Crear Agendamiento
                    </button>
                </div>
            </FormGroup>

            {tab === 'listar' && (
                <FormGroup>
                    <h2>Filtros</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '20px' }}>
                        <Select
                            label="Paciente"
                            options={[{ label: 'Todos', value: '' }, ...pacienteOptions]}
                            value={filtros.paciente_id}
                            onChange={(e) => setFiltros({ ...filtros, paciente_id: e.target.value })}
                        />

                        <Select
                            label="Médico"
                            options={[{ label: 'Todos', value: '' }, ...medicoOptions]}
                            value={filtros.medico_id}
                            onChange={(e) => setFiltros({ ...filtros, medico_id: e.target.value })}
                        />

                        <Select
                            label="Estado"
                            options={estadoOptions}
                            value={filtros.estado}
                            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                        />
                    </div>

                    <Button onClick={cargarAgendamientos} disabled={loading} variant="primary">
                        Buscar
                    </Button>

                    {loading ? (
                        <Spinner />
                    ) : (
                        <Table
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'paciente_nombre', label: 'Paciente' },
                                { key: 'medico_nombre', label: 'Médico' },
                                { key: 'fecha_cita', label: 'Fecha' },
                                { key: 'hora_cita', label: 'Hora' },
                                { key: 'estado', label: 'Estado' },
                                {
                                    key: 'acciones',
                                    label: 'Acciones',
                                    render: (_, row) => (
                                        <>
                                            {row.estado !== 'CANCELADA' && row.estado !== 'COMPLETADA' && (
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleCancelarAgendamiento(row.id)}
                                                    style={{ padding: '5px 10px', fontSize: '12px' }}
                                                >
                                                    Cancelar
                                                </Button>
                                            )}
                                        </>
                                    ),
                                },
                            ]}
                            data={agendamientos}
                        />
                    )}
                </FormGroup>
            )}

            {tab === 'crear' && (
                <FormGroup>
                    <h2>Crear Nuevo Agendamiento</h2>

                    <form onSubmit={handleCrearAgendamiento}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <Select
                                label="Paciente"
                                options={pacienteOptions}
                                value={formAgendamiento.paciente_id}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        paciente_id: e.target.value,
                                    })
                                }
                                error={errors.paciente_id}
                                required
                            />

                            <Select
                                label="Especialidad"
                                options={especialidadOptions}
                                value={formAgendamiento.especialidad_id}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        especialidad_id: e.target.value,
                                    })
                                }
                            />

                            <Select
                                label="Médico"
                                options={medicoOptions}
                                value={formAgendamiento.medico_id}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        medico_id: e.target.value,
                                    })
                                }
                                error={errors.medico_id}
                                required
                            />

                            <Input
                                label="Fecha"
                                type="date"
                                value={formAgendamiento.fecha_cita}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        fecha_cita: e.target.value,
                                    })
                                }
                                error={errors.fecha_cita}
                                required
                            />

                            <Input
                                label="Hora"
                                type="time"
                                value={formAgendamiento.hora_cita}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        hora_cita: e.target.value,
                                    })
                                }
                                error={errors.hora_cita}
                                required
                            />

                            <Input
                                label="Motivo"
                                type="text"
                                value={formAgendamiento.motivo}
                                onChange={(e) =>
                                    setFormAgendamiento({
                                        ...formAgendamiento,
                                        motivo: e.target.value,
                                    })
                                }
                                placeholder="Motivo de la consulta"
                            />
                        </div>

                        <div style={{ marginTop: '20px' }}>
                            <Button type="submit" disabled={loading} variant="primary">
                                {loading ? 'Creando...' : 'Crear Agendamiento'}
                            </Button>
                        </div>

                        {loading && <Spinner />}
                    </form>
                </FormGroup>
            )}
        </div>
    );
};

export default AgendamientoPage;
