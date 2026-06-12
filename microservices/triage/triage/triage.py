import psycopg2
import psycopg2.extras
from flask import Blueprint, request, jsonify
from .db import get_connection

triage_bp = Blueprint('triage', __name__)

NIVELES_INFO = {
    1: {
        "nombre": "RESUCITACION",
        "riesgo": "Riesgo vital inmediato",
        "recomendaciones": "Atención inmediata en sala de reanimación. Activar código de emergencia de inmediato."
    },
    2: {
        "nombre": "EMERGENCIA",
        "riesgo": "Situación de alta gravedad",
        "recomendaciones": "Atención rápida prioritaria. Tiempo de espera máximo 15 minutos en box de atención."
    },
    3: {
        "nombre": "URGENCIA",
        "riesgo": "Urgencia médica con potencial de complicación",
        "recomendaciones": "Atención en consultorio médico. Tiempo de espera máximo 30 minutos."
    },
    4: {
        "nombre": "SEMIURGENCIA",
        "riesgo": "Condición de menor urgencia",
        "recomendaciones": "Atención médica general. Tiempo de espera sugerido menor a 60 minutos."
    },
    5: {
        "nombre": "NO_URGENCIA",
        "riesgo": "Consulta no urgente o de baja complejidad",
        "recomendaciones": "Atención por consulta externa o general. Tiempo de espera menor a 120 minutos."
    }
}

def calcular_nivel_triage(sintomas, signos_vitales):
    sintomas_texto = " ".join(sintomas).lower()
    
    # Manejo seguro de tipos
    try:
        temperatura = float(signos_vitales.get('temperatura', 37.0) or 37.0)
    except (TypeError, ValueError):
        temperatura = 37.0
        
    try:
        ritmo_cardiaco = int(signos_vitales.get('frecuencia_cardiaca', 80) or 80)
    except (TypeError, ValueError):
        ritmo_cardiaco = 80

    try:
        saturacion_oxigeno = float(signos_vitales.get('saturacion_oxigeno', 98.0) or 98.0)
    except (TypeError, ValueError):
        saturacion_oxigeno = 98.0

    criticos_n1 = ['inconsciente', 'paro', 'asfixia', 'convulsion']
    if any(p in sintomas_texto for p in criticos_n1) or ritmo_cardiaco > 140 or temperatura > 41.0 or saturacion_oxigeno < 85:
        return 1

    criticos_n2 = ['pecho', 'respirar', 'desmayo', 'hemorragia', 'infarto']
    if any(p in sintomas_texto for p in criticos_n2) or ritmo_cardiaco > 120 or temperatura > 39.5 or saturacion_oxigeno < 90:
        return 2

    medios_n3 = ['fractura', 'deshidratacion', 'abdominal', 'vomito', 'dolor agudo']
    if any(p in sintomas_texto for p in medios_n3) or temperatura > 38.5 or ritmo_cardiaco > 100:
        return 3

    leves_n4 = ['dolor', 'corte', 'esguince', 'diarrea', 'fiebre']
    if any(p in sintomas_texto for p in leves_n4) or temperatura > 37.5:
        return 4

    return 5

@triage_bp.route('/triage', methods=['POST'])
def recibir_triage():
    datos = request.get_json()
    if not datos:
        return jsonify({"error": "Se requiere cuerpo JSON."}), 400

    id_paciente = datos.get('id_paciente')
    sintomas = datos.get('sintomas', [])
    signos_vitales = datos.get('signos_vitales', {})

    if not id_paciente:
        return jsonify({"error": "El campo id_paciente es requerido."}), 400

    nivel_calculado = calcular_nivel_triage(sintomas, signos_vitales)
    sintomas_txt = ", ".join(sintomas)
    info = NIVELES_INFO.get(nivel_calculado, NIVELES_INFO[5])

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
        "nivel_asignado": info["nombre"],
        "nivel_numero": nivel_calculado,
        "riesgo_asignado": info["riesgo"],
        "recomendaciones": info["recomendaciones"]
    }), 201

@triage_bp.route('/triage/<int:id_paciente>', methods=['GET'])
def consultar_triage(id_paciente):
    try:
        conn = get_connection()
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute("SELECT * FROM evaluacion_triage WHERE id_paciente = %s ORDER BY fecha_evaluacion DESC;", (id_paciente,))
        historial = cur.fetchall()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cur.close()
        conn.close()

    for row in historial:
        nivel_num = row.get("nivel", 5)
        info = NIVELES_INFO.get(nivel_num, NIVELES_INFO[5])
        row["nivel_asignado"] = info["nombre"]
        row["nivel_numero"] = nivel_num
        row["riesgo_asignado"] = info["riesgo"]
        row["recomendaciones"] = info["recomendaciones"]
        if "fecha_evaluacion" in row and row["fecha_evaluacion"]:
            row["fecha"] = row["fecha_evaluacion"].strftime("%Y-%m-%d %H:%M:%S")
        else:
            row["fecha"] = "N/A"
            
    return jsonify(historial), 200