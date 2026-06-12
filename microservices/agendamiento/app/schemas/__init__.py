from app import ma
from app.models import (
    Paciente, Medico, Especialidad,
    DisponibilidadMedico, Agendamiento, HistorialAgendamiento
)
from marshmallow import fields, validate, validates, ValidationError
from marshmallow_sqlalchemy import auto_field


# ─── Especialidad ───────────────────────────────────────────────────────────────

class EspecialidadSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = Especialidad
        load_instance = False
        include_fk = True
        exclude = ("medicos",)


# ─── Paciente ───────────────────────────────────────────────────────────────────

class PacienteSchema(ma.SQLAlchemyAutoSchema):
    nombre_completo = fields.String(dump_only=True)

    class Meta:
        model = Paciente
        load_instance = False
        exclude = ("agendamientos",)


class PacienteCreateSchema(ma.Schema):
    numero_documento = fields.Str(required=True, validate=validate.Length(min=5, max=20))
    tipo_documento = fields.Str(
        load_default="CC",
        validate=validate.OneOf(["CC", "TI", "CE", "PA"])
    )
    nombres = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    apellidos = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    fecha_nacimiento = fields.Date(required=True)
    genero = fields.Str(required=True, validate=validate.OneOf(["M", "F", "O"]))
    email = fields.Email(required=True)
    telefono = fields.Str(required=True, validate=validate.Length(min=7, max=20))
    direccion = fields.Str(load_default=None)
    ciudad = fields.Str(load_default=None)


# ─── Médico ─────────────────────────────────────────────────────────────────────

class MedicoSchema(ma.SQLAlchemyAutoSchema):
    nombre_completo = fields.String(dump_only=True)
    especialidad = fields.Nested(EspecialidadSchema, dump_only=True)

    class Meta:
        model = Medico
        load_instance = False
        exclude = ("disponibilidades", "agendamientos")


class MedicoCreateSchema(ma.Schema):
    numero_registro = fields.Str(required=True, validate=validate.Length(min=3, max=30))
    nombres = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    apellidos = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    email = fields.Email(required=True)
    telefono = fields.Str(required=True, validate=validate.Length(min=7, max=20))
    especialidad_id = fields.Int(required=True)
    duracion_consulta_min = fields.Int(load_default=30, validate=validate.Range(min=10, max=120))
    tarifa_consulta = fields.Decimal(load_default=None, places=2)


# ─── Disponibilidad ─────────────────────────────────────────────────────────────

class DisponibilidadSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = DisponibilidadMedico
        load_instance = False
        include_fk = True


class DisponibilidadCreateSchema(ma.Schema):
    medico_id = fields.Int(required=True)
    dia_semana = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO"]
        )
    )
    hora_inicio = fields.Time(required=True)
    hora_fin = fields.Time(required=True)

    @validates("hora_fin")
    def validate_hora_fin(self, value):
        pass  # La validación cruzada se hace en el servicio


# ─── Historial ──────────────────────────────────────────────────────────────────

class HistorialSchema(ma.SQLAlchemyAutoSchema):
    class Meta:
        model = HistorialAgendamiento
        load_instance = False
        include_fk = True


# ─── Agendamiento ───────────────────────────────────────────────────────────────

class AgendamientoSchema(ma.SQLAlchemyAutoSchema):
    paciente = fields.Nested(PacienteSchema, dump_only=True)
    medico = fields.Nested(MedicoSchema, dump_only=True)
    historial = fields.List(fields.Nested(HistorialSchema), dump_only=True)

    class Meta:
        model = Agendamiento
        load_instance = False
        include_fk = True


class AgendamientoListSchema(ma.SQLAlchemyAutoSchema):
    """Schema resumido para listados."""
    paciente_nombre = fields.Method("get_paciente_nombre")
    medico_nombre = fields.Method("get_medico_nombre")
    especialidad_nombre = fields.Method("get_especialidad_nombre")

    class Meta:
        model = Agendamiento
        load_instance = False
        fields = (
            "id", "codigo_cita", "fecha_cita", "hora_inicio", "hora_fin",
            "estado", "tipo_consulta", "modalidad", "nivel_triaje",
            "paciente_nombre", "medico_nombre", "especialidad_nombre",
            "creado_en"
        )

    def get_paciente_nombre(self, obj):
        return obj.paciente.nombre_completo if obj.paciente else None

    def get_medico_nombre(self, obj):
        return obj.medico.nombre_completo if obj.medico else None

    def get_especialidad_nombre(self, obj):
        if obj.medico and obj.medico.especialidad:
            return obj.medico.especialidad.nombre
        return None


class AgendamientoCreateSchema(ma.Schema):
    paciente_id = fields.Int(required=True)
    medico_id = fields.Int(required=True)
    fecha_cita = fields.Date(required=True)
    hora_inicio = fields.Time(required=True)
    tipo_consulta = fields.Str(
        load_default="PRIMERA_VEZ",
        validate=validate.OneOf(["PRIMERA_VEZ", "CONTROL", "URGENCIA", "SEGUIMIENTO"])
    )
    modalidad = fields.Str(
        load_default="VIDEOCONSULTA",
        validate=validate.OneOf(["VIDEOCONSULTA", "CHAT", "TELEFONO"])
    )
    motivo_consulta = fields.Str(load_default=None, validate=validate.Length(max=2000))
    notas_adicionales = fields.Str(load_default=None, validate=validate.Length(max=1000))
    nivel_triaje = fields.Str(
        load_default=None,
        validate=validate.OneOf(["VERDE", "AMARILLO", "NARANJA", "ROJO"])
    )
    puntaje_triaje = fields.Int(load_default=None, validate=validate.Range(min=0, max=100))


class AgendamientoUpdateEstadoSchema(ma.Schema):
    estado = fields.Str(
        required=True,
        validate=validate.OneOf(
            ["PENDIENTE", "CONFIRMADA", "EN_CURSO", "COMPLETADA", "CANCELADA", "NO_ASISTIO"]
        )
    )
    motivo_cancelacion = fields.Str(load_default=None, validate=validate.Length(max=255))
    observacion = fields.Str(load_default=None)
    modificado_por = fields.Str(load_default=None)


# Instancias exportables
especialidad_schema = EspecialidadSchema()
especialidades_schema = EspecialidadSchema(many=True)

paciente_schema = PacienteSchema()
pacientes_schema = PacienteSchema(many=True)

medico_schema = MedicoSchema()
medicos_schema = MedicoSchema(many=True)

disponibilidad_schema = DisponibilidadSchema()
disponibilidades_schema = DisponibilidadSchema(many=True)

agendamiento_schema = AgendamientoSchema()
agendamientos_schema = AgendamientoSchema(many=True)
agendamientos_list_schema = AgendamientoListSchema(many=True)
historial_schema = HistorialSchema(many=True)
