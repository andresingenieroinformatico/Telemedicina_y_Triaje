import React, { useState, useEffect } from 'react';
import AgendamientoService from '../services/agendamiento.service';
import MedicoService from '../services/medico.service';
import PacienteService from '../services/paciente.service';
import EspecialidadService from '../services/especialidad.service';
import { Alert, Button, Input, Select, FormGroup, Spinner, Table } from '../components/UIComponents';

const AgendamientoPage = () => {
    const [tab, setTab] = useState('listar');
    const [agendamientos, setAgendamientos] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [especialidades, setEspecialidades] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [filtros, setFiltros] = useState({ paciente_id: '', medico_id: '', estado: '' });
    const [formAgendamiento, setFormAgendamiento] = useState({
        paciente_id: '',
        medico_id: '',
        especialidad_id: '',
        fecha_cita: '',
        hora_cita: '',
        motivo: '',
    });

    useEffect(() => {
        cargarEspecialidades();
        cargarMedicos();
        cargarPacientes();
    }, []);

    const cargarAgendamientos = React.useCallback(async () => {
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
    }, [filtros]);

    const cargarMedicos = async () => {
        try {
            const data = await MedicoService.listar();
            setMedicos(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Error al cargar medicos:', err);
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

    useEffect(() => {
        if (tab === 'listar') cargarAgendamientos();
    }, [tab, cargarAgendamientos]);

    const validateForm = () => {
        const newErrors = {};

        if (!formAgendamiento.paciente_id) newErrors.paciente_id = 'El paciente es requerido';
        if (!formAgendamiento.medico_id) newErrors.medico_id = 'El medico es requerido';
        if (!formAgendamiento.fecha_cita) newErrors.fecha_cita = 'La fecha es requerida';
        if (!formAgendamiento.hora_cita) newErrors.hora_cita = 'La hora es requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCrearAgendamiento = async (e) => {
        e.preventDefault();
        setError('');
        setErrors({});

        if (!validateForm()) return;

        setLoading(true);

        try {
            const payload = {
                paciente_id: parseInt(formAgendamiento.paciente_id),
                medico_id: parseInt(formAgendamiento.medico_id),
                fecha_cita: formAgendamiento.fecha_cita,
                hora_cita: formAgendamiento.hora_cita,
                motivo: formAgendamiento.motivo || 'Consulta medica',
            };

            await AgendamientoService.crear(payload);
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
        if (!window.confirm('Esta seguro de que desea cancelar este agendamiento?')) return;

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
        { label: 'En curso', value: 'EN_CURSO' },
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
        <main className="page-shell">
            <p className="eyebrow" style={{ color: '#155eef' }}>Agenda medica</p>
            <h1>Gestion de agendamientos</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Coordina citas, filtra disponibilidad y crea nuevos agendamientos con un flujo rapido y ordenado.
            </p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <FormGroup>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button type="button" onClick={() => setTab('listar')} variant={tab === 'listar' ? 'primary' : 'secondary'}>
                        Listar agendamientos
                    </Button>
                    <Button type="button" onClick={() => setTab('crear')} variant={tab === 'crear' ? 'primary' : 'secondary'}>
                        Crear agendamiento
                    </Button>
                </div>
            </FormGroup>

            {tab === 'listar' && (
                <FormGroup>
                    <h2>Filtros</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                        <Select
                            label="Paciente"
                            options={[{ label: 'Todos', value: '' }, ...pacienteOptions]}
                            value={filtros.paciente_id}
                            onChange={(e) => setFiltros({ ...filtros, paciente_id: e.target.value })}
                        />
                        <Select
                            label="Medico"
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
                        <Spinner label="Cargando agenda..." />
                    ) : (
                        <Table
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'paciente_nombre', label: 'Paciente' },
                                { key: 'medico_nombre', label: 'Medico' },
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
                                                    style={{ minHeight: '34px', padding: '7px 10px', fontSize: '0.82rem' }}
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
                    <h2>Crear nuevo agendamiento</h2>
                    <form onSubmit={handleCrearAgendamiento}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
                            <Select
                                label="Paciente"
                                options={pacienteOptions}
                                value={formAgendamiento.paciente_id}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, paciente_id: e.target.value })}
                                error={errors.paciente_id}
                                required
                            />
                            <Select
                                label="Especialidad"
                                options={especialidadOptions}
                                value={formAgendamiento.especialidad_id}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, especialidad_id: e.target.value })}
                            />
                            <Select
                                label="Medico"
                                options={medicoOptions}
                                value={formAgendamiento.medico_id}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, medico_id: e.target.value })}
                                error={errors.medico_id}
                                required
                            />
                            <Input
                                label="Fecha"
                                type="date"
                                value={formAgendamiento.fecha_cita}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, fecha_cita: e.target.value })}
                                error={errors.fecha_cita}
                                required
                            />
                            <Input
                                label="Hora"
                                type="time"
                                value={formAgendamiento.hora_cita}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, hora_cita: e.target.value })}
                                error={errors.hora_cita}
                                required
                            />
                            <Input
                                label="Motivo"
                                type="text"
                                value={formAgendamiento.motivo}
                                onChange={(e) => setFormAgendamiento({ ...formAgendamiento, motivo: e.target.value })}
                                placeholder="Motivo de la consulta"
                            />
                        </div>

                        <Button type="submit" disabled={loading} variant="primary">
                            {loading ? 'Creando...' : 'Crear agendamiento'}
                        </Button>

                        {loading && <Spinner />}
                    </form>
                </FormGroup>
            )}
        </main>
    );
};

export default AgendamientoPage;
