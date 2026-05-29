import React, { useEffect, useState } from 'react';
import HistorialMedicoService from '../services/historial-medico.service';
import { Alert, FormGroup, Spinner, Table } from '../components/UIComponents';

/**
 * Plantilla visual para el microservicio de Historial Médico
 */
const HistorialMedicoPage = () => {
    const [pacientes, setPacientes] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const pacientesData = await HistorialMedicoService.listarPacientes();
            const pacientesLista = Array.isArray(pacientesData) ? pacientesData : pacientesData?.items || [];
            setPacientes(pacientesLista);

            if (pacientesLista[0]?.id) {
                const resumenData = await HistorialMedicoService.obtenerResumenPaciente(pacientesLista[0].id);
                setResumen(resumenData);
            }
        } catch (err) {
            setError(err.message || 'No fue posible cargar el historial médico.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px 40px' }}>
            <h1>🩺 Historial Médico</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>
                Plantilla base para gestionar pacientes, consultas, medicamentos y signos vitales del módulo de historial médico.
            </p>

            {error && <Alert type="error" message={error} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <FormGroup>
                    <strong>Pacientes registrados</strong>
                    <div style={{ fontSize: '28px', marginTop: '8px' }}>{pacientes.length}</div>
                </FormGroup>
                <FormGroup>
                    <strong>Resumen activo</strong>
                    <div style={{ fontSize: '14px', marginTop: '8px', color: '#555' }}>
                        {resumen ? `${resumen.paciente || 'Paciente'} — ${resumen.estado || 'Resumen disponible'}` : 'Sin resumen cargado aún'}
                    </div>
                </FormGroup>
                <FormGroup>
                    <strong>Servicios incluidos</strong>
                    <ul style={{ margin: '8px 0 0 18px', color: '#555' }}>
                        <li>Pacientes</li>
                        <li>Consultas</li>
                        <li>Medicamentos</li>
                        <li>Signos vitales</li>
                    </ul>
                </FormGroup>
            </div>

            {loading ? <Spinner /> : (
                <>
                    <h2>Lista de pacientes</h2>
                    <Table
                        columns={[
                            { key: 'id', label: 'ID' },
                            { key: 'nombre', label: 'Nombre' },
                            { key: 'correo', label: 'Correo' },
                            { key: 'telefono', label: 'Teléfono' },
                        ]}
                        data={pacientes}
                    />
                </>
            )}
        </div>
    );
};

export default HistorialMedicoPage;
