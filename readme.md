# 🏥 Telemedicina API — Módulo de Triaje Automatizado

Este módulo gestiona la clasificación de riesgo de pacientes (1-5) y almacena el historial de evaluaciones utilizando **Flask** y una base de datos PostgreSQL hospedada en **Neon (Vercel)**.

---

## 🗄️ Modelo de Datos (PostgreSQL - Neon)

### Tabla: `evaluacion_triage`

| Columna | Tipo de Datos | Restricciones |
| :--- | :--- | :--- |
| `id_evaluacion` | SERIAL | PRIMARY KEY |
| `id_paciente` | INTEGER | NOT NULL |
| `nivel` | INTEGER | NOT NULL |
| `sintomas_reportados` | TEXT | NOT NULL |
| `temperatura` | NUMERIC(4, 2) | En grados Celsius |
| `frecuencia_cardiaca` | INTEGER | Latidos por minuto |
| `fecha_evaluacion` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

* **Constraints:** `CONSTRAINT evaluacion_triage_pkey PRIMARY KEY (id_evaluacion)`
* **Indexes:** `UNIQUE INDEX evaluacion_triage_pkey ... USING BTREE (id_evaluacion)`

---

## 📡 Documentación de Endpoints

### 1. Registrar Evaluación de Triaje
* **Ruta:** `/triage`
* **Método:** `POST`
* **Descripción:** Analiza los síntomas y signos vitales mediante el algoritmo para asignar la prioridad (Niveles 1 al 5) e insertar el registro en Neon.

#### REQUEST
```json
{
  "id_paciente": 105,
  "sintomas": [
    "dolor en el pecho",
    "dificultad para respirar"
  ],
  "signos_vitales": {
    "temperatura": 37.5,
    "frecuencia_cardiaca": 110
  }
}
```

#### RESPONSE
```json
{
  "estado": "exito",
  "id_evaluacion": 222,
  "id_paciente": 105,
  "nivel_asignado": 2
}
```

### 2. Consultar Historial de Triaje
* **Ruta:** `/triage/<id_paciente>`
* **Método:** `GET`
* **Descripción:** Recupera el historial completo de las evaluaciones de triaje de un paciente ordenadas de forma cronológica descendente.

#### REQUEST
```json
curl -X GET http://localhost:5000/triage/13
```

#### RESPONSE
```json
[
  {
    "id_evaluacion": 4,
    "id_paciente": 105,
    "nivel": 2,
    "sintomas_reportados": "dolor, fractura",
    "temperatura": "37.50",
    "frecuencia_cardiaca": 95,
    "fecha_evaluacion": "Sat, 23 May 2026 19:30:00 GMT"
  },
  {
    "id_evaluacion": 1,
    "id_paciente": 105,
    "nivel": 3,
    "sintomas_reportados": "dolor de cabeza leve",
    "temperatura": "36.80",
    "frecuencia_cardiaca": 80,
    "fecha_evaluacion": "Wed, 15 Apr 2026 10:15:22 GMT"
  }
]