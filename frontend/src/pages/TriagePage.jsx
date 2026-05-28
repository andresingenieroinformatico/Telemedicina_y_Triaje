import React from 'react';

/**
 * Página de Triaje - Evaluación de pacientes
 */
const TriagePage = () => {
    const [pacientId, setPacientId] = React.useState('');
    const [sintomas, setSintomas] = React.useState([]);
    const [signos_vitales, setSignosVitales] = React.useState({
        temperatura: '',
        frecuencia_cardiaca: '',
    });
    const [resultado, setResultado] = React.useState(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleEvaluar = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // TODO: Integrar con TriageService
            console.log('Evaluación de triaje:', {
                pacientId,
                sintomas,
                signos_vitales,
            });
            alert('Triage evaluation placeholder - connect to TriageService');
        } catch (err) {
            setError(err.message || 'Error en la evaluación');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px', margin: '20px auto' }}>
            <h1>Evaluación de Triaje</h1>
            <form onSubmit={handleEvaluar}>
                <div>
                    <label>ID Paciente:</label>
                    <input
                        type="number"
                        value={pacientId}
                        onChange={(e) => setPacientId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Síntomas (separados por coma):</label>
                    <textarea
                        value={sintomas.join(', ')}
                        onChange={(e) =>
                            setSintomas(e.target.value.split(',').map((s) => s.trim()))
                        }
                        rows="4"
                        placeholder="dolor en el pecho, dificultad para respirar"
                    />
                </div>

                <div>
                    <label>Temperatura (°C):</label>
                    <input
                        type="number"
                        step="0.1"
                        value={signos_vitales.temperatura}
                        onChange={(e) =>
                            setSignosVitales({
                                ...signos_vitales,
                                temperatura: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                <div>
                    <label>Frecuencia Cardíaca (lpm):</label>
                    <input
                        type="number"
                        value={signos_vitales.frecuencia_cardiaca}
                        onChange={(e) =>
                            setSignosVitales({
                                ...signos_vitales,
                                frecuencia_cardiaca: e.target.value,
                            })
                        }
                        required
                    />
                </div>

                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit" disabled={loading}>
                    {loading ? 'Evaluando...' : 'Evaluar'}
                </button>
            </form>

            {resultado && (
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
                    <h2>Resultado: Nivel {resultado.nivel_asignado}</h2>
                    <pre>{JSON.stringify(resultado, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default TriagePage;
