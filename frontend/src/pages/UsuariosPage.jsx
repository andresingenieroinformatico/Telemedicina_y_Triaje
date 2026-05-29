import React, { useEffect, useState } from 'react';
import UsuarioService from '../services/usuario.service';
import { Alert, FormGroup, Spinner, Table } from '../components/UIComponents';

/**
 * Plantilla visual para el microservicio de Usuarios
 */
const UsuariosPage = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarUsuarios();
    }, []);

    const cargarUsuarios = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await UsuarioService.listar();
            setUsuarios(Array.isArray(data) ? data : data?.items || []);
        } catch (err) {
            setError(err.message || 'No fue posible cargar los usuarios.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px 40px' }}>
            <h1>👤 Usuarios y Seguridad</h1>
            <p style={{ color: '#555', marginBottom: '20px' }}>
                Plantilla base para administrar usuarios, autenticación y control de acceso del microservicio de usuarios.
            </p>

            {error && <Alert type="error" message={error} />}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <FormGroup>
                    <strong>Usuarios activos</strong>
                    <div style={{ fontSize: '28px', marginTop: '8px' }}>{usuarios.length}</div>
                </FormGroup>
                <FormGroup>
                    <strong>Autenticación</strong>
                    <div style={{ fontSize: '14px', marginTop: '8px', color: '#555' }}>Login, sesiones y control de acceso.</div>
                </FormGroup>
                <FormGroup>
                    <strong>Roles sugeridos</strong>
                    <ul style={{ margin: '8px 0 0 18px', color: '#555' }}>
                        <li>Administrador</li>
                        <li>Médico</li>
                        <li>Paciente</li>
                    </ul>
                </FormGroup>
            </div>

            {loading ? <Spinner /> : (
                <>
                    <h2>Vista de usuarios</h2>
                    <Table
                        columns={[
                            { key: 'id', label: 'ID' },
                            { key: 'username', label: 'Usuario' },
                            { key: 'email', label: 'Correo' },
                            { key: 'rol', label: 'Rol' },
                        ]}
                        data={usuarios}
                    />
                </>
            )}
        </div>
    );
};

export default UsuariosPage;
