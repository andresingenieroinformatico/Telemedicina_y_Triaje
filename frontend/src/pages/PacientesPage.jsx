import React, { useState, useEffect, useCallback, useRef } from 'react';
import PacienteService from '../services/paciente.service';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Íconos inline (SVG) – sin dependencias extra
───────────────────────────────────────────── */
const IconSearch = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
    </svg>
);
const IconUser = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
);
const IconEdit = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);
const IconPlus = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
    </svg>
);
const IconClose = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M18 6 6 18M6 6l12 12" />
    </svg>
);
const IconRefresh = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
    </svg>
);
const IconPhone = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.68 4.87 2 2 0 0 1 3.65 2.68h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 10a16 16 0 0 0 6.06 6.06l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);
const IconMail = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
);
const IconAge = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0" /><path d="M12 8v4l3 3" />
    </svg>
);
const IconSave = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><path d="M17 21v-8H7v8" /><path d="M7 3v5h8" />
    </svg>
);

/* ─────────────────────────────────────────────
   Subcomponente: Avatar de iniciales
───────────────────────────────────────────── */
const Avatar = ({ nombre, size = 40 }) => {
    const initials = nombre
        ? nombre.split(' ').slice(0, 2).map(p => p[0]).join('').toUpperCase()
        : '?';
    const hue = nombre
        ? [...nombre].reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360
        : 200;
    return (
        <div
            style={{
                width: size, height: size, borderRadius: '50%',
                background: `linear-gradient(135deg, hsl(${hue},60%,52%), hsl(${(hue + 40) % 360},70%,42%))`,
                display: 'grid', placeItems: 'center',
                color: '#fff', fontWeight: 900,
                fontSize: size * 0.36,
                flexShrink: 0,
                boxShadow: `0 6px 18px hsl(${hue},50%,50%,0.32)`,
            }}
        >
            {initials}
        </div>
    );
};

/* ─────────────────────────────────────────────
   Subcomponente: Badge de edad
───────────────────────────────────────────── */
const AgeBadge = ({ edad }) => {
    if (!edad) return <span className="pac-badge pac-badge--neutral">—</span>;
    const label = edad < 18 ? 'Menor' : edad < 60 ? 'Adulto' : 'Adulto mayor';
    const cls = edad < 18 ? 'pac-badge--info' : edad < 60 ? 'pac-badge--success' : 'pac-badge--warning';
    return <span className={`pac-badge ${cls}`}>{edad} años · {label}</span>;
};

/* ─────────────────────────────────────────────
   Formulario de paciente (crear / editar)
───────────────────────────────────────────── */
const FORM_EMPTY = { nombre: '', correo: '', telefono: '', edad: '' };

const PacienteForm = ({ inicial, onGuardar, onCancelar, guardando }) => {
    const [form, setForm] = useState(inicial || FORM_EMPTY);
    const [errores, setErrores] = useState({});
    const primeraRef = useRef(null);

    useEffect(() => { primeraRef.current?.focus(); }, []);

    const set = (k, v) => {
        setForm(f => ({ ...f, [k]: v }));
        setErrores(e => ({ ...e, [k]: '' }));
    };

    const validar = () => {
        const e = {};
        if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
        if (!form.correo.trim()) {
            e.correo = 'El correo es obligatorio';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo)) {
            e.correo = 'Correo inválido';
        }
        if (form.edad && (isNaN(Number(form.edad)) || Number(form.edad) < 0 || Number(form.edad) > 120)) {
            e.edad = 'Edad entre 0 y 120';
        }
        setErrores(e);
        return Object.keys(e).length === 0;
    };

    const submit = (ev) => {
        ev.preventDefault();
        if (validar()) onGuardar(form);
    };

    return (
        <form onSubmit={submit} className="pac-form" noValidate>
            <div className="ui-field">
                <label className="ui-label" htmlFor="pac-nombre">Nombre completo *</label>
                <input
                    ref={primeraRef}
                    id="pac-nombre"
                    className={`ui-control ${errores.nombre ? 'ui-control--error' : ''}`}
                    value={form.nombre}
                    onChange={e => set('nombre', e.target.value)}
                    placeholder="Ej. María González López"
                    autoComplete="name"
                />
                {errores.nombre && <span className="ui-error">{errores.nombre}</span>}
            </div>

            <div className="ui-field">
                <label className="ui-label" htmlFor="pac-correo">Correo electrónico *</label>
                <input
                    id="pac-correo"
                    type="email"
                    className={`ui-control ${errores.correo ? 'ui-control--error' : ''}`}
                    value={form.correo}
                    onChange={e => set('correo', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                />
                {errores.correo && <span className="ui-error">{errores.correo}</span>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="ui-field">
                    <label className="ui-label" htmlFor="pac-telefono">Teléfono</label>
                    <input
                        id="pac-telefono"
                        className="ui-control"
                        value={form.telefono}
                        onChange={e => set('telefono', e.target.value)}
                        placeholder="Ej. 3001234567"
                        autoComplete="tel"
                    />
                </div>
                <div className="ui-field">
                    <label className="ui-label" htmlFor="pac-edad">Edad</label>
                    <input
                        id="pac-edad"
                        type="number"
                        min="0" max="120"
                        className={`ui-control ${errores.edad ? 'ui-control--error' : ''}`}
                        value={form.edad}
                        onChange={e => set('edad', e.target.value)}
                        placeholder="Ej. 35"
                    />
                    {errores.edad && <span className="ui-error">{errores.edad}</span>}
                </div>
            </div>

            <div className="pac-form-actions">
                <button
                    type="button"
                    className="ui-button ui-button--secondary"
                    onClick={onCancelar}
                    disabled={guardando}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="ui-button ui-button--primary"
                    disabled={guardando}
                    id="pac-form-submit"
                >
                    {guardando
                        ? <><span className="pac-spin" /> Guardando...</>
                        : <><IconSave /> {inicial ? 'Actualizar paciente' : 'Registrar paciente'}</>
                    }
                </button>
            </div>
        </form>
    );
};

/* ─────────────────────────────────────────────
   Panel lateral de detalle
───────────────────────────────────────────── */
const DetallePaciente = ({ paciente, onEditar, onCerrar }) => (
    <aside className="pac-detail-panel" aria-label="Detalle del paciente">
        <div className="pac-detail-header">
            <button className="pac-icon-btn" onClick={onCerrar} aria-label="Cerrar detalle" title="Cerrar">
                <IconClose />
            </button>
        </div>

        <div className="pac-detail-hero">
            <Avatar nombre={paciente.nombre} size={64} />
            <div>
                <h2 style={{ margin: '0 0 4px', fontSize: '1.18rem' }}>{paciente.nombre}</h2>
                <span className="pac-badge pac-badge--neutral">ID #{paciente.id}</span>
            </div>
        </div>

        <div className="pac-detail-body">
            <div className="pac-info-row">
                <span className="pac-info-icon"><IconMail /></span>
                <div>
                    <span className="pac-info-label">Correo</span>
                    <span className="pac-info-value">{paciente.correo || '—'}</span>
                </div>
            </div>
            <div className="pac-info-row">
                <span className="pac-info-icon"><IconPhone /></span>
                <div>
                    <span className="pac-info-label">Teléfono</span>
                    <span className="pac-info-value">{paciente.telefono || '—'}</span>
                </div>
            </div>
            <div className="pac-info-row">
                <span className="pac-info-icon"><IconAge /></span>
                <div>
                    <span className="pac-info-label">Edad</span>
                    <AgeBadge edad={paciente.edad} />
                </div>
            </div>
        </div>

        <button
            className="ui-button ui-button--primary pac-detail-edit-btn"
            onClick={() => onEditar(paciente)}
            id="pac-detail-editar"
        >
            <IconEdit /> Editar paciente
        </button>
    </aside>
);

/* ─────────────────────────────────────────────
   Componente principal
───────────────────────────────────────────── */
const PacientesPage = () => {
    const { user } = useAuth();

    // ── Estado principal ──
    const [pacientes, setPacientes] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [exito, setExito] = useState('');

    // ── Búsqueda ──
    const [busqueda, setBusqueda] = useState('');
    const busquedaRef = useRef(null);

    // ── Selección / detalle ──
    const [seleccionado, setSeleccionado] = useState(null);

    // ── Modal crear / editar ──
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [pacienteEditar, setPacienteEditar] = useState(null);
    const [guardando, setGuardando] = useState(false);

    // ── Acceso restringido ──
    const esMedico = user?.rol?.toLowerCase() === 'medico';

    /* Carga la lista de pacientes */
    const cargarPacientes = useCallback(async () => {
        if (!esMedico) return;
        setLoading(true);
        setError('');
        try {
            const data = await PacienteService.listar();
            const lista = Array.isArray(data) ? data : data?.pacientes || [];
            setPacientes(lista);
            setFiltrados(lista);
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || 'Error al cargar pacientes';
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [esMedico]);

    useEffect(() => { cargarPacientes(); }, [cargarPacientes]);

    /* Filtro local por búsqueda */
    useEffect(() => {
        const q = busqueda.trim().toLowerCase();
        if (!q) { setFiltrados(pacientes); return; }
        setFiltrados(
            pacientes.filter(p =>
                p.nombre?.toLowerCase().includes(q) ||
                p.correo?.toLowerCase().includes(q) ||
                p.telefono?.includes(q)
            )
        );
    }, [busqueda, pacientes]);

    /* Mensajes de éxito auto-cierre */
    useEffect(() => {
        if (!exito) return;
        const t = setTimeout(() => setExito(''), 4000);
        return () => clearTimeout(t);
    }, [exito]);

    /* Guarda (crea o actualiza) un paciente */
    const handleGuardar = async (datos) => {
        setGuardando(true);
        setError('');
        try {
            if (modoEdicion && pacienteEditar) {
                await PacienteService.actualizar(pacienteEditar.id, datos);
                setExito('Paciente actualizado correctamente.');
                // Actualiza el seleccionado si sigue abierto
                if (seleccionado?.id === pacienteEditar.id) {
                    setSeleccionado({ ...pacienteEditar, ...datos });
                }
            } else {
                await PacienteService.crear({ ...datos, contraseña: 'temporal123' });
                setExito('Paciente registrado correctamente.');
            }
            cerrarModal();
            await cargarPacientes();
        } catch (err) {
            const msg = typeof err === 'string' ? err : err?.message || 'Error al guardar';
            setError(msg);
        } finally {
            setGuardando(false);
        }
    };

    const abrirCrear = () => {
        setModoEdicion(false);
        setPacienteEditar(null);
        setModalAbierto(true);
    };

    const abrirEditar = (paciente) => {
        setModoEdicion(true);
        setPacienteEditar(paciente);
        setModalAbierto(true);
    };

    const cerrarModal = () => {
        setModalAbierto(false);
        setPacienteEditar(null);
        setModoEdicion(false);
    };

    // ── Acceso denegado ──
    if (!esMedico) {
        return (
            <main className="page-shell">
                <div className="pac-access-denied">
                    <span style={{ fontSize: '2.4rem' }}>🔒</span>
                    <h1 style={{ fontSize: '1.5rem' }}>Acceso restringido</h1>
                    <p>Solo el personal médico puede acceder al directorio de pacientes.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="page-shell" id="pacientes-page">
            {/* ── Cabecera ── */}
            <header className="pac-page-header">
                <div>
                    <p className="eyebrow" style={{ color: 'var(--blue)', marginBottom: 6 }}>
                        Directorio clínico
                    </p>
                    <h1 style={{ margin: 0 }}>Pacientes</h1>
                    <p className="muted" style={{ marginTop: 6 }}>
                        {pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''} registrado{pacientes.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <div className="pac-header-actions">
                    <button
                        className="ui-button ui-button--secondary"
                        onClick={cargarPacientes}
                        disabled={loading}
                        title="Recargar lista"
                        id="pac-btn-refresh"
                    >
                        <IconRefresh /> Actualizar
                    </button>
                    <button
                        className="ui-button ui-button--primary"
                        onClick={abrirCrear}
                        id="pac-btn-nuevo"
                    >
                        <IconPlus /> Nuevo paciente
                    </button>
                </div>
            </header>

            {/* ── Alertas ── */}
            {exito && (
                <div className="ui-alert ui-alert--success" role="alert">
                    <span className="ui-alert__icon">✓</span>
                    <span>{exito}</span>
                    <button className="ui-alert__close" onClick={() => setExito('')} aria-label="Cerrar">×</button>
                </div>
            )}
            {error && (
                <div className="ui-alert ui-alert--error" role="alert">
                    <span className="ui-alert__icon">!</span>
                    <span>{error}</span>
                    <button className="ui-alert__close" onClick={() => setError('')} aria-label="Cerrar">×</button>
                </div>
            )}

            {/* ── Buscador ── */}
            <div className="pac-search-row">
                <div className="pac-search-wrap">
                    <span className="pac-search-icon" aria-hidden="true"><IconSearch /></span>
                    <input
                        ref={busquedaRef}
                        id="pac-buscador"
                        className="pac-search-input"
                        type="search"
                        placeholder="Buscar por nombre, correo o teléfono…"
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        autoComplete="off"
                    />
                    {busqueda && (
                        <button
                            className="pac-search-clear"
                            onClick={() => { setBusqueda(''); busquedaRef.current?.focus(); }}
                            aria-label="Limpiar búsqueda"
                        >
                            <IconClose />
                        </button>
                    )}
                </div>
                <span className="pac-result-count">
                    {busqueda
                        ? `${filtrados.length} resultado${filtrados.length !== 1 ? 's' : ''}`
                        : ''
                    }
                </span>
            </div>

            {/* ── Layout principal ── */}
            <div className={`pac-layout ${seleccionado ? 'pac-layout--split' : ''}`}>

                {/* ── Tabla ── */}
                <section className="pac-table-section">
                    {loading ? (
                        <div className="pac-loading">
                            <div className="ui-spinner__ring" />
                            <p>Cargando pacientes…</p>
                        </div>
                    ) : filtrados.length === 0 ? (
                        <div className="pac-empty">
                            <span style={{ fontSize: '2.8rem' }}>👥</span>
                            <h2 style={{ margin: '12px 0 6px' }}>
                                {busqueda ? 'Sin resultados' : 'Sin pacientes'}
                            </h2>
                            <p className="muted">
                                {busqueda
                                    ? `No se encontraron pacientes para "${busqueda}".`
                                    : 'Registra el primer paciente usando el botón "Nuevo paciente".'}
                            </p>
                            {busqueda && (
                                <button className="ui-button ui-button--secondary" onClick={() => setBusqueda('')}>
                                    Limpiar búsqueda
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="ui-table-wrap">
                            <table className="ui-table" aria-label="Listado de pacientes">
                                <thead>
                                    <tr>
                                        <th>Paciente</th>
                                        <th>Correo</th>
                                        <th>Teléfono</th>
                                        <th>Edad</th>
                                        <th style={{ textAlign: 'center' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtrados.map(p => (
                                        <tr
                                            key={p.id}
                                            className={`ui-table__row--clickable ${seleccionado?.id === p.id ? 'pac-row--active' : ''}`}
                                            onClick={() => setSeleccionado(seleccionado?.id === p.id ? null : p)}
                                            aria-selected={seleccionado?.id === p.id}
                                        >
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <Avatar nombre={p.nombre} size={34} />
                                                    <div>
                                                        <div style={{ fontWeight: 760, color: 'var(--ink)' }}>{p.nombre}</div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--muted-2)' }}>ID #{p.id}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <a
                                                    href={`mailto:${p.correo}`}
                                                    className="pac-link"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    {p.correo || '—'}
                                                </a>
                                            </td>
                                            <td>{p.telefono || <span style={{ color: 'var(--muted-2)' }}>—</span>}</td>
                                            <td><AgeBadge edad={p.edad} /></td>
                                            <td style={{ textAlign: 'center' }}>
                                                <button
                                                    className="pac-action-btn"
                                                    onClick={ev => { ev.stopPropagation(); abrirEditar(p); }}
                                                    aria-label={`Editar ${p.nombre}`}
                                                    title="Editar paciente"
                                                    id={`pac-editar-${p.id}`}
                                                >
                                                    <IconEdit /> Editar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* ── Panel de detalle ── */}
                {seleccionado && (
                    <DetallePaciente
                        paciente={seleccionado}
                        onEditar={abrirEditar}
                        onCerrar={() => setSeleccionado(null)}
                    />
                )}
            </div>

            {/* ── Modal Crear / Editar ── */}
            {modalAbierto && (
                <div
                    className="pac-modal-backdrop"
                    onClick={ev => { if (ev.target === ev.currentTarget) cerrarModal(); }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="pac-modal-title"
                >
                    <div className="pac-modal">
                        <div className="pac-modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span className="feature-icon" style={{ width: 36, height: 36 }}>
                                    <IconUser />
                                </span>
                                <h2 id="pac-modal-title" style={{ margin: 0, fontSize: '1.15rem' }}>
                                    {modoEdicion ? 'Editar paciente' : 'Registrar nuevo paciente'}
                                </h2>
                            </div>
                            <button className="pac-icon-btn" onClick={cerrarModal} aria-label="Cerrar modal">
                                <IconClose />
                            </button>
                        </div>
                        <div className="pac-modal-body">
                            <PacienteForm
                                inicial={modoEdicion ? pacienteEditar : null}
                                onGuardar={handleGuardar}
                                onCancelar={cerrarModal}
                                guardando={guardando}
                            />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default PacientesPage;