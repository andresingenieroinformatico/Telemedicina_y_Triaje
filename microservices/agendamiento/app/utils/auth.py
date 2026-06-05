"""Decoradores de autenticación y autorización."""
from functools import wraps
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
from app.utils import error_response


def require_jwt(fn):
    """Decorador para requerir JWT válido."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        return fn(*args, **kwargs)
    return wrapper


def require_role(*roles):
    """Decorador para requerir rol específico."""
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            usuario_rol = claims.get("rol")
            
            if usuario_rol not in roles:
                return error_response(
                    f"No autorizado. Roles requeridos: {', '.join(roles)}",
                    status_code=403
                )
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_usuario_id():
    """Obtiene el ID del usuario autenticado."""
    verify_jwt_in_request()
    return get_jwt_identity()


def get_usuario_rol():
    """Obtiene el rol del usuario autenticado."""
    verify_jwt_in_request()
    claims = get_jwt()
    return claims.get("rol")
