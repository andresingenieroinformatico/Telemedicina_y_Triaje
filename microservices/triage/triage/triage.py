from flask import Blueprint, request, jsonify
from .db import get_connection

triage_bp = Blueprint('triage', __name__)

def calcular_nivel_triage(sintomas, signos_vitales):
    sintomas_texto = " ".join(sintomas).lower()
    temperatura = signos_vitales.get('temperatura', 37.0)
    ritmo_cardiaco = signos_vitales.get('frecuencia_cardiaca', 80)

    criticos_n1 = ['inconsciente', 'paro', 'asfixia', 'convulsion']
    if any(p in sintomas_texto for p in criticos_n1) or ritmo_cardiaco > 140 or temperatura > 41.0 or saturacion_oxigeno < 85:
        return 1

    criticos_n2 = ['pecho', 'respirar', 'desmayo', 'hemorragia', 'infarto']
    if any(p in sintomas_texto for p in criticos_n2) or ritmo_cardiaco > 120 or temperatura > 39.5 or saturacion_oxigeno < 90:
        return 2

    medios_n3 = ['fractura', 'deshidratacion', 'abdomoninal', 'vomito', 'dolor agudo']
    if any(p in sintomas_texto for p in medios_n3) or temperatura > 38.5 or ritmo_cardiaco > 100:
        return 3

    leves_n4 = ['dolor', 'corte', 'esguince', 'diarrea', 'fiebre']
    if any(p in sintomas_texto for p in leves_n4) or temperatura > 37.5:
        return 4

    return 5

@triage_bp.route('/triage', methods=['POST'])
def recibir_triage():
    datos = request.get_json()
    id_paciente = datos.get('id_paciente')
    sintomas = datos.get('sintomas', [])
    signos_vitales = datos.get('signos_vitales', {})

    nivel_calculado = calcular_nivel_triage(sintomas, signos_vitales)
    sintomas_txt = ", ".join(sintomas)

    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            """
            INSERT INTO evaluacion_triage 
                (id_paciente, nivel, sintomas_reportados, temperatura, frecuencia_cardiaca)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id_evaluacion
            """,
            (
                id_paciente,
                nivel_calculado,
                sintomas_txt,
                signos_vitales.get('temperatura'),
                signos_vitales.get('frecuencia_cardiaca')
            )
        )
        id_evaluacion = cur.fetchone()[0]
        conn.commit()
    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    return jsonify({
        "estado": "exito",
        "id_evaluacion": id_evaluacion,
        "id_paciente": id_paciente,
        "nivel_asignado": nivel_calculado
    }), 201

@triage_bp.route('/triage/<int:id_paciente>', methods=['GET'])
def consultar_triage(id_paciente):
    conn = get_connection()
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    cur.execute("SELECT * FROM evaluacion_triage WHERE id_paciente = %s ORDER BY fecha_evaluacion DESC;", (id_paciente,))
    historial = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return jsonify(historial), 200