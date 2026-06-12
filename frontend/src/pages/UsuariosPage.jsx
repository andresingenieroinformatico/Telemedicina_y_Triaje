import React, { useEffect, useState } from 'react';
import UsuarioService from '../services/usuario.service';
import { Alert, FormGroup, Spinner, Table } from '../components/UIComponents';

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
        <main className="page-shell">
            <p className="eyebrow" style={{ color: '#155eef' }}>Administracion</p>
            <h1>Usuarios y seguridad</h1>
            <p className="muted" style={{ marginBottom: '22px' }}>
                Supervisa usuarios, roles y acceso del equipo clinico desde una vista limpia y escaneable.
            </p>

            {error && <Alert type="error" message={error} />}

            <section className="feature-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">01</span>
                    <strong>Usuarios activos</strong>
                    <div style={{ fontSize: '2rem', marginTop: '8px', fontWeight: 900 }}>{usuarios.length}</div>
                </FormGroup>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">02</span>
                    <strong>Autenticacion</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>Login, sesiones y control de acceso.</p>
                </FormGroup>
                <FormGroup>
                    <span className="feature-icon" aria-hidden="true">03</span>
                    <strong>Roles sugeridos</strong>
                    <p className="muted" style={{ margin: '8px 0 0' }}>Administrador, medico y paciente.</p>
                </FormGroup>
            </section>

            <FormGroup>
                <h2>Vista de usuarios</h2>
                {loading ? (
                    <Spinner />
                ) : (
                    <Table
                        columns={[
                            { key: 'id', label: 'ID' },
                            { key: 'username', label: 'Usuario' },
                            { key: 'email', label: 'Correo' },
                            { key: 'rol', label: 'Rol' },
                        ]}
                        data={usuarios}
                    />
                )}
            </FormGroup>
        </main>
    );
};

export default UsuariosPage;
