from marshmallow import Schema, fields, validate


class ConsultaCreateSchema(Schema):
    historial_id   = fields.Int(required=True)
    medico_id      = fields.Int(required=True)
    motivo         = fields.Str(required=True, validate=validate.Length(min=5, max=255))
    tipo           = fields.Str(validate=validate.OneOf(["presencial", "telemedicina"]),
                                load_default="telemedicina")
    sintomas       = fields.Str()
    diagnostico    = fields.Str()
    tratamiento    = fields.Str()
    notas_medico   = fields.Str()
    proxima_cita   = fields.DateTime(format="%Y-%m-%dT%H:%M:%S")
    estado         = fields.Str(validate=validate.OneOf(["pendiente","completada","cancelada"]),
                                load_default="completada")


class ConsultaUpdateSchema(Schema):
    motivo         = fields.Str(validate=validate.Length(min=5, max=255))
    sintomas       = fields.Str()
    diagnostico    = fields.Str()
    tratamiento    = fields.Str()
    notas_medico   = fields.Str()
    proxima_cita   = fields.DateTime(format="%Y-%m-%dT%H:%M:%S")
    estado         = fields.Str(validate=validate.OneOf(["pendiente","completada","cancelada"]))


class ConsultaSchema(Schema):
    id             = fields.Int(dump_only=True)
    historial_id   = fields.Int()
    medico_id      = fields.Int()
    fecha_consulta = fields.DateTime(dump_only=True)
    motivo         = fields.Str()
    tipo           = fields.Str()
    sintomas       = fields.Str()
    diagnostico    = fields.Str()
    tratamiento    = fields.Str()
    notas_medico   = fields.Str()
    proxima_cita   = fields.DateTime()
    estado         = fields.Str()
    creado_en      = fields.DateTime(dump_only=True)
    actualizado_en = fields.DateTime(dump_only=True)
