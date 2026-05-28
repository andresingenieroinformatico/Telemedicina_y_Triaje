import React from 'react';

/**
 * Componente para mostrar alertas y errores
 */
export const Alert = ({ type = 'info', message, onClose }) => {
    const backgroundColor = {
        success: '#d4edda',
        error: '#f8d7da',
        warning: '#fff3cd',
        info: '#d1ecf1',
    }[type];

    const borderColor = {
        success: '#c3e6cb',
        error: '#f5c6cb',
        warning: '#ffeaa7',
        info: '#bee5eb',
    }[type];

    const textColor = {
        success: '#155724',
        error: '#721c24',
        warning: '#856404',
        info: '#0c5460',
    }[type];

    return (
        <div
            style={{
                padding: '12px 20px',
                backgroundColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                borderRadius: '4px',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <span>{message}</span>
            {onClose && (
                <button
                    onClick={onClose}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: textColor,
                        cursor: 'pointer',
                        fontSize: '20px',
                    }}
                >
                    ×
                </button>
            )}
        </div>
    );
};

/**
 * Componente de botón reutilizable
 */
export const Button = ({ children, variant = 'primary', disabled = false, ...props }) => {
    const baseStyle = {
        padding: '10px 20px',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        transition: 'all 0.3s ease',
        opacity: disabled ? 0.6 : 1,
    };

    const variants = {
        primary: {
            backgroundColor: '#007bff',
            color: 'white',
        },
        secondary: {
            backgroundColor: '#6c757d',
            color: 'white',
        },
        success: {
            backgroundColor: '#28a745',
            color: 'white',
        },
        danger: {
            backgroundColor: '#dc3545',
            color: 'white',
        },
    };

    return (
        <button style={{ ...baseStyle, ...variants[variant] }} disabled={disabled} {...props}>
            {children}
        </button>
    );
};

/**
 * Componente de input reutilizable
 */
export const Input = ({ label, error, required = false, ...props }) => {
    return (
        <div style={{ marginBottom: '15px' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {label}
                    {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <input
                {...props}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: error ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                }}
            />
            {error && <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>{error}</small>}
        </div>
    );
};

/**
 * Componente de select reutilizable
 */
export const Select = ({ label, options, error, required = false, ...props }) => {
    return (
        <div style={{ marginBottom: '15px' }}>
            {label && (
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                    {label}
                    {required && <span style={{ color: 'red' }}>*</span>}
                </label>
            )}
            <select
                {...props}
                style={{
                    width: '100%',
                    padding: '10px',
                    border: error ? '2px solid #dc3545' : '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                }}
            >
                <option value="">-- Seleccione una opción --</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <small style={{ color: '#dc3545', display: 'block', marginTop: '5px' }}>{error}</small>}
        </div>
    );
};

/**
 * Componente de cargador/spinner
 */
export const Spinner = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <div
            style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #007bff',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 1s linear infinite',
                margin: '0 auto',
            }}
        >
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
        <p>Cargando...</p>
    </div>
);

/**
 * Componente de tabla reutilizable
 */
export const Table = ({ columns, data, onRowClick }) => {
    return (
        <table
            style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
            }}
        >
            <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                    {columns.map((col) => (
                        <th
                            key={col.key}
                            style={{
                                padding: '12px',
                                textAlign: 'left',
                                fontWeight: '600',
                                color: '#333',
                            }}
                        >
                            {col.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data && data.length > 0 ? (
                    data.map((row, idx) => (
                        <tr
                            key={idx}
                            onClick={() => onRowClick && onRowClick(row)}
                            style={{
                                borderBottom: '1px solid #dee2e6',
                                cursor: onRowClick ? 'pointer' : 'default',
                                backgroundColor: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                                ':hover': { backgroundColor: '#e9ecef' },
                            }}
                        >
                            {columns.map((col) => (
                                <td
                                    key={col.key}
                                    style={{
                                        padding: '12px',
                                        color: '#555',
                                    }}
                                >
                                    {col.render
                                        ? col.render(row[col.key], row)
                                        : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length} style={{ padding: '20px', textAlign: 'center' }}>
                            No hay datos disponibles
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
};

/**
 * Componente de formulario reutilizable
 */
export const FormGroup = ({ children, style = {} }) => {
    return (
        <div
            style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '4px',
                border: '1px solid #dee2e6',
                ...style,
            }}
        >
            {children}
        </div>
    );
};
