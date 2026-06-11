import React, { useEffect, useState } from 'react';
import HistorialMedicoService from '../services/historial-medico.service';
import { Alert, FormGroup, Spinner, Table } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';

const HistorialMedicoPage = () => {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarDatos();
    }, [user]);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');
        try {
            const rol = user?.rol?.toLowerCase();
            if (rol === 'medico') {
                const pacientesData = await HistorialMedicoService.listarPacientes();
                const lista = Array.isArray(pacientesData) ? pacientesData : pacientesData?.items || [];
                setPacientes(lista);

                if (lista.length > 0) {
                    const resumenData = await HistorialMedicoService.obtenerResumenPaciente(lista[0].id);
                    setResumen(resumenData);
                }
            } else if (user?.id) {
                const resumenData = await HistorialMedicoService.obtenerResumenPaciente(user.id);
                setResumen(resumenData);
                setPacientes([]);
            }
        } catch (err) {
            setError(err.message || 'No fue posible cargar el historial medico.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="page-shell">
            <p className="eyebrow" style={{ color: '#155eef' }}>Seguimiento clinico</p>
            <h1>Historial medico</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Gestiona pacientes, consultas, medicamentos y signos vitales con una lectura rapida y confiable.
            </p>

            {error && <Alert type="error" message={error} />}

            <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                {user?.rol?.toLowerCase() === 'medico' && (
                    <FormGroup>
                        <span className="feature-icon" aria-hidden="true">01</span>
                        <strong>Pacientes registrados</strong>
                        <div style={{ fontSize: '2rem', marginTop: '8px', fontWeight: 900 }}>{pacientes.length}</div>
                    </FormGroup>
                )}
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">{user?.rol?.toLowerCase() === 'medico' ? '02' : '01'}</span>
                    <strong>{user?.rol?.toLowerCase() === 'medico' ? 'Resumen activo' : 'Mi Historial'}</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>
                        {resumen ? `${resumen.paciente || 'Paciente'} - ${resumen.estado || 'Resumen disponible'}` : 'Sin resumen cargado aun'}
                    </p>
                </FormGroup>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">03</span>
                    <strong>Servicios incluidos</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>Pacientes, consultas, medicamentos y signos vitales.</p>
                </FormGroup>
            </section>

            {user?.rol?.toLowerCase() === 'medico' && (
                <FormGroup>
                    <h2>Lista de pacientes</h2>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <Table
                            columns={[
                                { key: 'id', label: 'ID' },
                                { key: 'nombre', label: 'Nombre' },
                                { key: 'correo', label: 'Correo' },
                                { key: 'telefono', label: 'Telefono' },
                            ]}
                            data={pacientes}
                        />
                    )}
                </FormGroup>
            )}
        </main>
    );
};

export default HistorialMedicoPage;
