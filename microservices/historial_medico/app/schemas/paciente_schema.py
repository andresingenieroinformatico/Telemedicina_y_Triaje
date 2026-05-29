"""
app/schemas/paciente_schema.py
Esquemas de serialización / validación para Paciente.
"""
from marshmallow import Schema, fields, validate, validates, ValidationError, post_load


class PacienteCreateSchema(Schema):
    cedula           = fields.Str(required=True, validate=validate.Length(min=5, max=20))
    nombres          = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    apellidos        = fields.Str(required=True, validate=validate.Length(min=2, max=100))
    fecha_nacimiento = fields.Date(required=True, format="%Y-%m-%d")
    genero           = fields.Str(required=True, validate=validate.OneOf(["M", "F", "Otro"]))
    tipo_sangre      = fields.Str(validate=validate.OneOf(
                        ["A+","A-","B+","B-","AB+","AB-","O+","O-"]), load_default=None)
    correo           = fields.Email(load_default=None)
    telefono         = fields.Str(validate=validate.Length(max=20), load_default=None)
    direccion        = fields.Str(validate=validate.Length(max=255), load_default=None)


class PacienteUpdateSchema(Schema):
    nombres          = fields.Str(validate=validate.Length(min=2, max=100))
    apellidos        = fields.Str(validate=validate.Length(min=2, max=100))
    fecha_nacimiento = fields.Date(format="%Y-%m-%d")
    genero           = fields.Str(validate=validate.OneOf(["M", "F", "Otro"]))
    tipo_sangre      = fields.Str(validate=validate.OneOf(
                        ["A+","A-","B+","B-","AB+","AB-","O+","O-"]))
    correo           = fields.Email()
    telefono         = fields.Str(validate=validate.Length(max=20))
    direccion        = fields.Str(validate=validate.Length(max=255))
    activo           = fields.Bool()


class PacienteSchema(Schema):
    """Esquema de respuesta (incluye campos calculados)."""
    id               = fields.Int(dump_only=True)
    cedula           = fields.Str()
    nombres          = fields.Str()
    apellidos        = fields.Str()
    fecha_nacimiento = fields.Date(format="%Y-%m-%d")
    edad             = fields.Int(dump_only=True)
    genero           = fields.Str()
    tipo_sangre      = fields.Str()
    correo           = fields.Email()
    telefono         = fields.Str()
    direccion        = fields.Str()
    activo           = fields.Bool()
    creado_en        = fields.DateTime(dump_only=True)
    actualizado_en   = fields.DateTime(dump_only=True)
