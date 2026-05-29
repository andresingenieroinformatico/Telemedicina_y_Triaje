from datetime import datetime, timezone
from microservices.videoconferencias.app import db


class TimestampMixin:
    """Mixin para agregar campos de auditoría."""
    creado_en = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    actualizado_en = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
