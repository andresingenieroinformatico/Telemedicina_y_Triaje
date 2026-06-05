from marshmallow import Schema, fields


class HistorialUpdateSchema(Schema):
    alergias                = fields.Str()
    enfermedades_cronicas   = fields.Str()
    cirugias_previas        = fields.Str()
    medicamentos_actuales   = fields.Str()
    habitos                 = fields.Str()
    antecedentes_familiares = fields.Str()
    observaciones           = fields.Str()


class HistorialSchema(Schema):
    id                      = fields.Int(dump_only=True)
    paciente_id             = fields.Int(dump_only=True)
    alergias                = fields.Str()
    enfermedades_cronicas   = fields.Str()
    cirugias_previas        = fields.Str()
    medicamentos_actuales   = fields.Str()
    habitos                 = fields.Str()
    antecedentes_familiares = fields.Str()
    observaciones           = fields.Str()
    creado_en               = fields.DateTime(dump_only=True)
    actualizado_en          = fields.DateTime(dump_only=True)
