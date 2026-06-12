from marshmallow import Schema, fields, validate


# ── Usuario ───────────────────────────────────────────────
class UsuarioSchema(Schema):
    id_usuario = fields.UUID(dump_only=True)
    nombre     = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    correo     = fields.Email(required=True)
    contrasena = fields.Str(required=True, load_only=True, validate=validate.Length(min=6))
    rol        = fields.Str(required=True, validate=validate.OneOf(["paciente", "medico", "admin"]))
    created_at = fields.DateTime(dump_only=True)


class UsuarioResponseSchema(Schema):
    id_usuario = fields.UUID(dump_only=True)
    nombre     = fields.Str()
    correo     = fields.Email()
    rol        = fields.Str()
    created_at = fields.DateTime(dump_only=True)


# ── Paciente ──────────────────────────────────────────────
class PacienteCreateSchema(Schema):
    id_usuario       = fields.UUID(required=True)
    documento        = fields.Str(required=True)
    fecha_nacimiento = fields.Date(required=True, format="%Y-%m-%d")
    genero           = fields.Str(validate=validate.OneOf(["M", "F", "otro"]))
    telefono         = fields.Str()
    direccion        = fields.Str()


class PacienteSchema(Schema):
    id_paciente      = fields.UUID(dump_only=True)
    id_usuario       = fields.UUID()
    documento        = fields.Str()
    fecha_nacimiento = fields.Date(format="%Y-%m-%d")
    edad             = fields.Int(dump_only=True)
    genero           = fields.Str()
    telefono         = fields.Str()
    direccion        = fields.Str()
    created_at       = fields.DateTime(dump_only=True)


# ── Medico ────────────────────────────────────────────────
class MedicoCreateSchema(Schema):
    id_usuario       = fields.UUID(required=True)
    especialidad     = fields.Str(required=True)
    numero_colegiado = fields.Str(required=True)


class MedicoSchema(Schema):
    id_medico        = fields.UUID(dump_only=True)
    id_usuario       = fields.UUID()
    especialidad     = fields.Str()
    numero_colegiado = fields.Str()
    created_at       = fields.DateTime(dump_only=True)


# ── HistorialMedico ───────────────────────────────────────
class HistorialCreateSchema(Schema):
    id_paciente   = fields.UUID(required=True)
    id_medico     = fields.UUID(required=True)
    diagnostico   = fields.Str()
    tratamiento   = fields.Str()
    observaciones = fields.Str()


class HistorialUpdateSchema(Schema):
    diagnostico   = fields.Str()
    tratamiento   = fields.Str()
    observaciones = fields.Str()


class HistorialSchema(Schema):
    id_historial  = fields.UUID(dump_only=True)
    id_paciente   = fields.UUID()
    id_medico     = fields.UUID()
    fecha         = fields.DateTime(dump_only=True)
    diagnostico   = fields.Str()
    tratamiento   = fields.Str()
    observaciones = fields.Str()
    created_at    = fields.DateTime(dump_only=True)


# ── Receta ────────────────────────────────────────────────
class RecetaCreateSchema(Schema):
    id_historial = fields.UUID(required=True)
    medicamento  = fields.Str(required=True)
    dosis        = fields.Str(required=True)
    indicaciones = fields.Str()
    duracion     = fields.Str()


class RecetaSchema(Schema):
    id_receta    = fields.UUID(dump_only=True)
    id_historial = fields.UUID()
    medicamento  = fields.Str()
    dosis        = fields.Str()
    indicaciones = fields.Str()
    duracion     = fields.Str()
    created_at   = fields.DateTime(dump_only=True)


# ── Cita ──────────────────────────────────────────────────
class CitaCreateSchema(Schema):
    id_paciente = fields.UUID(required=True)
    id_medico   = fields.UUID(required=True)
    fecha_cita  = fields.DateTime(required=True, format="%Y-%m-%dT%H:%M:%S")
    motivo      = fields.Str()
    estado      = fields.Str(validate=validate.OneOf(["pendiente","confirmada","cancelada","completada"]),
                             load_default="pendiente")


class CitaUpdateSchema(Schema):
    fecha_cita  = fields.DateTime(format="%Y-%m-%dT%H:%M:%S")
    motivo      = fields.Str()
    estado      = fields.Str(validate=validate.OneOf(["pendiente","confirmada","cancelada","completada"]))


class CitaSchema(Schema):
    id_cita     = fields.UUID(dump_only=True)
    id_paciente = fields.UUID()
    id_medico   = fields.UUID()
    fecha_cita  = fields.DateTime()
    motivo      = fields.Str()
    estado      = fields.Str()
    created_at  = fields.DateTime(dump_only=True)
