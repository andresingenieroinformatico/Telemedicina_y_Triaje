import React from 'react';

const alertMeta = {
    success: { label: 'Exito', icon: '✓' },
    error: { label: 'Error', icon: '!' },
    warning: { label: 'Aviso', icon: '!' },
    info: { label: 'Info', icon: 'i' },
};

/**
 * Componente para mostrar alertas y errores
 */
export const Alert = ({ type = 'info', message, onClose }) => {
    const meta = alertMeta[type] || alertMeta.info;

    return (
        <div className={`ui-alert ui-alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
            <span className="ui-alert__icon" aria-hidden="true">{meta.icon}</span>
            <div>
                <strong>{meta.label}</strong>
                <span>{message}</span>
            </div>
            {onClose && (
                <button className="ui-alert__close" onClick={onClose} aria-label="Cerrar alerta">
                    ×
                </button>
            )}
        </div>
    );
};

/**
 * Componente de boton reutilizable
 */
export const Button = ({ children, variant = 'primary', disabled = false, className = '', ...props }) => {
    return (
        <button
            className={`ui-button ui-button--${variant} ${className}`}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    );
};

/**
 * Componente de input reutilizable
 */
export const Input = ({ label, error, required = false, as, className = '', style, ...props }) => {
    const Control = as === 'textarea' ? 'textarea' : 'input';

    return (
        <div className={`ui-field ${className}`} style={style}>
            {label && (
                <label className="ui-label">
                    {label}
                    {required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            <Control
                {...props}
                className={`ui-control ${error ? 'ui-control--error' : ''}`}
                aria-invalid={Boolean(error)}
            />
            {error && <small className="ui-error">{error}</small>}
        </div>
    );
};

/**
 * Componente de select reutilizable
 */
export const Select = ({ label, options = [], error, required = false, className = '', style, ...props }) => {
    return (
        <div className={`ui-field ${className}`} style={style}>
            {label && (
                <label className="ui-label">
                    {label}
                    {required && <span aria-hidden="true"> *</span>}
                </label>
            )}
            <select
                {...props}
                className={`ui-control ui-select ${error ? 'ui-control--error' : ''}`}
                aria-invalid={Boolean(error)}
            >
                <option value="">Selecciona una opcion</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <small className="ui-error">{error}</small>}
        </div>
    );
};

/**
 * Componente de cargador/spinner
 */
export const Spinner = ({ label = 'Cargando...' }) => (
    <div className="ui-spinner" role="status" aria-live="polite">
        <span className="ui-spinner__ring" aria-hidden="true" />
        <p>{label}</p>
    </div>
);

/**
 * Componente de tabla reutilizable
 */
export const Table = ({ columns, data, onRowClick }) => {
    return (
        <div className="ui-table-wrap">
            <table className="ui-table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} scope="col">
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data && data.length > 0 ? (
                        data.map((row, idx) => (
                            <tr
                                key={row.id || idx}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={onRowClick ? 'ui-table__row--clickable' : ''}
                            >
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="ui-table__empty">
                                No hay datos disponibles
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

/**
 * Componente de formulario reutilizable
 */
export const FormGroup = ({ children, className = '', style = {} }) => {
    return (
        <section className={`ui-surface ${className}`} style={style}>
            {children}
        </section>
    );
};
