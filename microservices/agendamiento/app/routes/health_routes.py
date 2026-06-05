from flask import Blueprint
from app.utils import success_response

health_bp = Blueprint("health", __name__)


@health_bp.route("/health", methods=["GET"])
def health_check():
    """Verificación de estado de la API."""
    return success_response(
        data={
            "service": "Telemedicina API - Módulo de Agendamientos",
            "version": "1.0.0",
            "status": "healthy",
        },
        message="Servicio en línea"
    )
