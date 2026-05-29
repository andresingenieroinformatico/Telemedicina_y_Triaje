from marshmallow import Schema, fields, validate


class MedicamentoCreateSchema(Schema):
    nombre             = fields.Str(required=True, validate=validate.Length(min=2, max=150))
    principio_activo   = fields.Str()
    forma_farmaceutica = fields.Str()
    concentracion      = fields.Str()
    descripcion        = fields.Str()
    requiere_receta    = fields.Bool(load_default=True)


class MedicamentoSchema(Schema):
    id                 = fields.Int(dump_only=True)
    nombre             = fields.Str()
    principio_activo   = fields.Str()
    forma_farmaceutica = fields.Str()
    concentracion      = fields.Str()
    descripcion        = fields.Str()
    requiere_receta    = fields.Bool()
    activo             = fields.Bool()
    creado_en          = fields.DateTime(dump_only=True)


class PrescripcionSchema(Schema):
    id             = fields.Int(dump_only=True)
    consulta_id    = fields.Int()
    medicamento_id = fields.Int(required=True)
    dosis          = fields.Str(required=True)
    frecuencia     = fields.Str(required=True)
    duracion       = fields.Str()
    instrucciones  = fields.Str()
    creado_en      = fields.DateTime(dump_only=True)
