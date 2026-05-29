from marshmallow import Schema, fields, validate


class SignosVitalesCreateSchema(Schema):
    historial_id            = fields.Int(required=True)
    frecuencia_cardiaca     = fields.Float(validate=validate.Range(min=20, max=300))
    presion_sistolica       = fields.Float(validate=validate.Range(min=50, max=300))
    presion_diastolica      = fields.Float(validate=validate.Range(min=30, max=200))
    temperatura             = fields.Float(validate=validate.Range(min=30.0, max=45.0))
    saturacion_oxigeno      = fields.Float(validate=validate.Range(min=50.0, max=100.0))
    frecuencia_respiratoria = fields.Float(validate=validate.Range(min=5, max=60))
    glucosa                 = fields.Float(validate=validate.Range(min=20, max=600))
    peso                    = fields.Float(validate=validate.Range(min=1, max=500))
    altura                  = fields.Float(validate=validate.Range(min=0.3, max=2.7))
    fuente                  = fields.Str(load_default="traje_automatizado")
    observaciones           = fields.Str()


class SignosVitalesSchema(Schema):
    id                      = fields.Int(dump_only=True)
    historial_id            = fields.Int()
    frecuencia_cardiaca     = fields.Float()
    presion_sistolica       = fields.Float()
    presion_diastolica      = fields.Float()
    presion_arterial        = fields.Str(dump_only=True)   # propiedad calculada
    temperatura             = fields.Float()
    saturacion_oxigeno      = fields.Float()
    frecuencia_respiratoria = fields.Float()
    glucosa                 = fields.Float()
    peso                    = fields.Float()
    altura                  = fields.Float()
    imc                     = fields.Float(dump_only=True)  # propiedad calculada
    fuente                  = fields.Str()
    observaciones           = fields.Str()
    registrado_en           = fields.DateTime(dump_only=True)
