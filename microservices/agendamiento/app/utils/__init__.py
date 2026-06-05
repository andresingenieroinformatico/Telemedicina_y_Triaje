from flask import jsonify
from typing import Any


def success_response(data: Any = None, message: str = "OK", status_code: int = 200):
    """Respuesta exitosa estándar."""
    response = {"success": True, "message": message}
    if data is not None:
        response["data"] = data
    return jsonify(response), status_code


def error_response(message: str, status_code: int = 400, errors: Any = None):
    """Respuesta de error estándar."""
    response = {"success": False, "message": message}
    if errors:
        response["errors"] = errors
    return jsonify(response), status_code


def paginate_query(query, page: int, per_page: int, schema):
    """Pagina una query de SQLAlchemy y serializa con un schema."""
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return {
        "items": schema.dump(pagination.items),
        "total": pagination.total,
        "pages": pagination.pages,
        "page": pagination.page,
        "per_page": pagination.per_page,
        "has_next": pagination.has_next,
        "has_prev": pagination.has_prev,
    }
