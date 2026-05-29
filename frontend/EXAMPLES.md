# Ejemplos de Uso - Frontend Telemedicina

## 1. Usar el AuthContext en un componente

```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Alert } from '../components/UIComponents';

function MiComponente() {
    const { user, isAuthenticated, login, logout, loading, error } = useAuth();

    const handleLogin = async () => {
        try {
            await login('admin', 'password');
        } catch (err) {
            console.error('Error:', err);
        }
    };

    return (
        <div>
            {error && <Alert type="error" message={error} />}
            
            {isAuthenticated ? (
                <>
                    <p>Bienvenido, {user?.username}</p>
                    <Button onClick={logout} variant="danger">
                        Logout
                    </Button>
                </>
            ) : (
                <Button onClick={handleLogin} disabled={loading}>
                    Login
                </Button>
            )}
        </div>
    );
}

export default MiComponente;
```

## 2. Usar ProtectedRoute

```jsx
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MiPaginaPrivada from './pages/MiPaginaPrivada';

function App() {
    return (
        <Routes>
            <Route
                path="/mi-pagina"
                element={
                    <ProtectedRoute>
                        <MiPaginaPrivada />
                    </ProtectedRoute>
                }
            />
        </Routes>
    );
}
```

## 3. Usar servicios para obtener datos

```jsx
import React, { useState, useEffect } from 'react';
import PacienteService from '../services/paciente.service';
import MedicoService from '../services/medico.service';
import { Spinner, Alert } from '../components/UIComponents';

function MiComponente() {
    const [pacientes, setPacientes] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        setError('');

        try {
            const [pacientesData, medicosData] = await Promise.all([
                PacienteService.listar(),
                MedicoService.listar()
            ]);

            setPacientes(pacientesData || []);
            setMedicos(medicosData || []);
        } catch (err) {
            setError(err.message || 'Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Spinner />;
    if (error) return <Alert type="error" message={error} />;

    return (
        <div>
            <h2>Pacientes: {pacientes.length}</h2>
            <h2>Médicos: {medicos.length}</h2>
        </div>
    );
}

export default MiComponente;
```

## 4. Crear un formulario con validaciones

```jsx
import React, { useState } from 'react';
import { Input, Select, Button, Alert } from '../components/UIComponents';
import PacienteService from '../services/paciente.service';

function CrearPaciente() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        tipo_documento: 'DNI',
        numero_documento: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.nombre.trim()) {
            newErrors.nombre = 'El nombre es requerido';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'El email es requerido';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
        }
        if (!formData.numero_documento.trim()) {
            newErrors.numero_documento = 'El documento es requerido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            await PacienteService.crear(formData);
            setSuccess(true);
            setFormData({
                nombre: '',
                email: '',
                tipo_documento: 'DNI',
                numero_documento: '',
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {success && (
                <Alert
                    type="success"
                    message="Paciente creado exitosamente"
                    onClose={() => setSuccess(false)}
                />
            )}

            {errors.submit && (
                <Alert type="error" message={errors.submit} />
            )}

            <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                }
                error={errors.nombre}
                required
            />

            <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                }
                error={errors.email}
                required
            />

            <Select
                label="Tipo de Documento"
                options={[
                    { label: 'DNI', value: 'DNI' },
                    { label: 'Pasaporte', value: 'PASAPORTE' },
                ]}
                value={formData.tipo_documento}
                onChange={(e) =>
                    setFormData({ ...formData, tipo_documento: e.target.value })
                }
            />

            <Input
                label="Número de Documento"
                value={formData.numero_documento}
                onChange={(e) =>
                    setFormData({
                        ...formData,
                        numero_documento: e.target.value,
                    })
                }
                error={errors.numero_documento}
                required
            />

            <Button type="submit" disabled={loading} variant="primary">
                {loading ? 'Creando...' : 'Crear Paciente'}
            </Button>
        </form>
    );
}

export default CrearPaciente;
```

## 5. Usar la Table para mostrar datos

```jsx
import React, { useState, useEffect } from 'react';
import { Table, Button } from '../components/UIComponents';
import AgendamientoService from '../services/agendamiento.service';

function ListarAgendamientos() {
    const [agendamientos, setAgendamientos] = useState([]);

    useEffect(() => {
        cargarAgendamientos();
    }, []);

    const cargarAgendamientos = async () => {
        try {
            const data = await AgendamientoService.listar();
            setAgendamientos(data || []);
        } catch (err) {
            console.error('Error:', err);
        }
    };

    const handleCancelar = async (id) => {
        if (confirm('¿Está seguro?')) {
            try {
                await AgendamientoService.cancelar(id);
                await cargarAgendamientos();
            } catch (err) {
                console.error('Error:', err);
            }
        }
    };

    return (
        <Table
            columns={[
                { key: 'id', label: 'ID' },
                { key: 'paciente_nombre', label: 'Paciente' },
                { key: 'medico_nombre', label: 'Médico' },
                { key: 'fecha_cita', label: 'Fecha' },
                { key: 'estado', label: 'Estado' },
                {
                    key: 'acciones',
                    label: 'Acciones',
                    render: (_, row) => (
                        <Button
                            variant="danger"
                            onClick={() => handleCancelar(row.id)}
                            style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                            Cancelar
                        </Button>
                    ),
                },
            ]}
            data={agendamientos}
        />
    );
}

export default ListarAgendamientos;
```

## 6. Crear un servicio personalizado

```javascript
// services/mi-servicio.service.js
import axios from 'axios';
import { API_BASE_URLS } from './api.config';

class MiServicio {
    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URLS.AGENDAMIENTO,
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    setAuthToken(token) {
        if (token) {
            this.client.defaults.headers.Authorization = `Bearer ${token}`;
        } else {
            delete this.client.defaults.headers.Authorization;
        }
    }

    async miMetodo(data) {
        try {
            const response = await this.client.post('/api/v1/mi-endpoint', data);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    }
}

export default new MiServicio();
```

## 7. Manejar errores globalmente

```jsx
function App() {
    return (
        <AuthProvider>
            <MainApp />
        </AuthProvider>
    );
}

// En AuthContext.jsx o en un middleware
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Redirigir a login
            window.location.href = '/login';
        } else if (error.response?.status === 403) {
            // Acceso prohibido
            console.error('Acceso denegado');
        } else if (error.response?.status === 500) {
            // Error del servidor
            console.error('Error interno del servidor');
        }

        return Promise.reject(error);
    }
);
```

## 8. Agregar un modal o dialog

```jsx
import React, { useState } from 'react';
import { Button, FormGroup } from '../components/UIComponents';

function ConDialog() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <Button onClick={() => setShowModal(true)}>
                Abrir Modal
            </Button>

            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <FormGroup
                        style={{
                            maxWidth: '500px',
                            backgroundColor: 'white',
                            padding: '30px',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2>Mi Modal</h2>
                        <p>Contenido aquí</p>
                        <Button onClick={() => setShowModal(false)}>
                            Cerrar
                        </Button>
                    </FormGroup>
                </div>
            )}
        </>
    );
}

export default ConDialog;
```

## 9. Usar localStorage para persistencia

```jsx
import React, { useEffect, useState } from 'react';

function MiComponente() {
    const [datos, setDatos] = useState(() => {
        // Cargar del localStorage al inicializar
        const saved = localStorage.getItem('misDatos');
        return saved ? JSON.parse(saved) : null;
    });

    useEffect(() => {
        if (datos) {
            // Guardar en localStorage cuando cambia
            localStorage.setItem('misDatos', JSON.stringify(datos));
        }
    }, [datos]);

    return (
        <div>
            {/* Componente */}
        </div>
    );
}

export default MiComponente;
```

## 10. Crear un hook personalizado

```javascript
// hooks/useFetch.js
import { useState, useEffect } from 'react';

export function useFetch(fn) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fn();
            setData(result);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    return { data, loading, error, refetch: fetch };
}
```

Uso:
```jsx
import { useFetch } from '../hooks/useFetch';
import PacienteService from '../services/paciente.service';

function MiComponente() {
    const { data: pacientes, loading, error, refetch } = useFetch(
        () => PacienteService.listar()
    );

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>{pacientes?.length || 0} pacientes</div>;
}
```
