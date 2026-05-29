import React, { useEffect, useState } from 'react';
import PacienteService from '../services/paciente.service';
import { Alert, Button, FormGroup, Input, Spinner, Table } from '../components/UIComponents';

const PacientesPage = () => {
    const [pacientes, setPacientes] = useState([]);
    const [documento, setDocumento] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarPacientes();
    }, []);

    const normalizarLista = (data) => {
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        if (Array.isArray(data?.data)) return data.data;
        return data ? [data] : [];
    };

    const cargarPacientes = async () => {
        setLoading(true);
        setError('');

        try {
            const data = await PacienteService.listar();
            setPacientes(normalizarLista(data));
        } catch (err) {
            setError(err.message || 'No fue posible cargar los pacientes.');
        } finally {
            setLoading(false);
        }
    };

    const buscarPorDocumento = async (e) => {
        e.preventDefault();

        if (!documento.trim()) {
            cargarPacientes();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const data = await PacienteService.buscarPorDocumento(documento.trim());
            setPacientes(normalizarLista(data));
        } catch (err) {
            setError(err.message || 'No fue posible encontrar el paciente.');
            setPacientes([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-shell">
            <p className="eyebrow" style={{ color: '#175cd3' }}>Gestion clinica</p>
            <h1>Pacientes</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Consulta pacientes registrados, documentos y datos de contacto para coordinar atencion y seguimiento.
            </p>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}

            <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">01</span>
                    <strong>Pacientes activos</strong>
                    <div style={{ fontSize: '2rem', marginTop: '8px', fontWeight: 900 }}>{pacientes.length}</div>
                </FormGroup>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">02</span>
                    <strong>Busqueda por documento</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>Encuentra rapidamente al paciente antes de triage o agenda.</p>
                </FormGroup>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">03</span>
                    <strong>Continuidad asistencial</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>Conecta pacientes con citas, historial y seguimiento clinico.</p>
                </FormGroup>
            </section>

            <FormGroup>
                <h2>Directorio de pacientes</h2>
                <form onSubmit={buscarPorDocumento} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                    <Input
                        label="Documento"
                        type="text"
                        value={documento}
                        onChange={(e) => setDocumento(e.target.value)}
                        placeholder="Buscar por numero de documento"
                    />
                    <Button type="submit" disabled={loading}>
                        Buscar
                    </Button>
                </form>

                {loading ? (
                    <Spinner label="Cargando pacientes..." />
                ) : (
                    <Table
                        columns={[
                            { key: 'id', label: 'ID' },
                            {
                                key: 'nombre',
                                label: 'Paciente',
                                render: (_, row) => row.nombre || `${row.nombres || ''} ${row.apellidos || ''}`.trim() || 'N/A',
                            },
                            { key: 'numero_documento', label: 'Documento' },
                            { key: 'email', label: 'Correo' },
                            { key: 'telefono', label: 'Telefono' },
                        ]}
                        data={pacientes}
                    />
                )}
            </FormGroup>
        </main>
    );
};

export default PacientesPage;
