import React, { useState, useEffect } from 'react';
import PacienteService from '../services/paciente.service';
import { Alert, Table, Spinner } from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';

const PacientesPage = () => {
    const { user } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Mapeo de columnas compatible con el componente Table (key/label)
    const columns = [
        { label: 'ID', key: 'id' },
        { label: 'Nombre Completo', key: 'nombre' },
        { label: 'Correo Electrónico', key: 'correo' },
        { label: 'Teléfono', key: 'telefono' },
        { label: 'Edad', key: 'edad' }
    ];

    useEffect(() => {
        cargarPacientes();
    }, []);

    const cargarPacientes = async () => {
        if (user?.rol?.toLowerCase() !== 'medico') {
            setError('Acceso restringido: Solo el personal médico puede ver esta lista.');
            return;
        }

        setLoading(true);
        try {
            const data = await PacienteService.listar();
            setPacientes(data || []);
        } catch (err) {
            setError(err.message || 'Error al conectar con el servicio de usuarios');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="pacientes-container">
            <h1>Listado de Pacientes</h1>
            
            {error && <Alert type="error" message={error} />}
            
            {loading ? (
                <Spinner />
            ) : (
                <Table 
                    columns={columns} 
                    data={pacientes} 
                />
            )}
        </div>
    );
};

export default PacientesPage;