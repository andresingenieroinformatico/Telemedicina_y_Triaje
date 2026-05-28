import React from 'react';

/**
 * Página de Agendamiento - Gestión de citas
 */
const AgendamientoPage = () => {
    const [agendamientos, setAgendamientos] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    const [filtros, setFiltros] = React.useState({
        paciente_id: '',
        medico_id: '',
        estado: 'PENDIENTE',
    });

    const handleCargarAgendamientos = async () => {
        setLoading(true);
        setError('');

        try {
            // TODO: Integrar con AgendamientoService
            console.log('Cargando agendamientos con filtros:', filtros);
            alert('Agendamiento list placeholder - connect to AgendamientoService');
        } catch (err) {
            setError(err.message || 'Error al cargar agendamientos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ margin: '20px' }}>
            <h1>Gestión de Agendamientos</h1>

            <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f9f9f9' }}>
                <h3>Filtros</h3>
                <div>
                    <label>ID Paciente:</label>
                    <input
                        type="number"
                        value={filtros.paciente_id}
                        onChange={(e) =>
                            setFiltros({ ...filtros, paciente_id: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label>ID Médico:</label>
                    <input
                        type="number"
                        value={filtros.medico_id}
                        onChange={(e) =>
                            setFiltros({ ...filtros, medico_id: e.target.value })
                        }
                    />
                </div>
                <div>
                    <label>Estado:</label>
                    <select
                        value={filtros.estado}
                        onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
                    >
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="CONFIRMADA">Confirmada</option>
                        <option value="EN_CURSO">En Curso</option>
                        <option value="COMPLETADA">Completada</option>
                        <option value="CANCELADA">Cancelada</option>
                    </select>
                </div>
                <button onClick={handleCargarAgendamientos} disabled={loading}>
                    {loading ? 'Cargando...' : 'Buscar'}
                </button>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}

            <div>
                <h3>Agendamientos</h3>
                {agendamientos.length === 0 ? (
                    <p>No hay agendamientos</p>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f0f0f0' }}>
                                <th>ID</th>
                                <th>Paciente</th>
                                <th>Médico</th>
                                <th>Fecha</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {agendamientos.map((ag) => (
                                <tr key={ag.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td>{ag.id}</td>
                                    <td>{ag.paciente_nombre}</td>
                                    <td>{ag.medico_nombre}</td>
                                    <td>{ag.fecha_cita}</td>
                                    <td>{ag.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default AgendamientoPage;
