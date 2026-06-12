from __future__ import annotations

from datetime import datetime, timezone
from typing import List, Optional

from config import db
from sqlalchemy import ForeignKey, Integer, String, Text, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Sala(db.Model):
    __tablename__ = "salas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    url_sala: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    jitsi_room_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, unique=True)
    descripcion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    estado: Mapped[str] = mapped_column(String(50), default="activa")
    capacidad_max: Mapped[int] = mapped_column(Integer, default=10)
    fecha_creacion: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    sesiones: Mapped[List["Sesion"]] = relationship(
        "Sesion",
        back_populates="sala",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def __init__(
        self,
        nombre: str,
        url_sala: str,
        descripcion: Optional[str] = None,
        capacidad_max: int = 10,
        estado: str = "activa",
        jitsi_room_name: Optional[str] = None,
    ) -> None:
        self.nombre = nombre
        self.url_sala = url_sala
        self.descripcion = descripcion
        self.capacidad_max = capacidad_max
        self.estado = estado
        self.jitsi_room_name = jitsi_room_name

    def to_dict(self, include_sesiones: bool = False) -> dict:
        data: dict = {
            "id":              self.id,
            "nombre":          self.nombre,
            "url_sala":        self.url_sala,
            "jitsi_room_name": self.jitsi_room_name,
            "descripcion":     self.descripcion,
            "estado":          self.estado,
            "capacidad_max":   self.capacidad_max,
            "fecha_creacion":  (
                self.fecha_creacion.isoformat() if self.fecha_creacion else None
            ),
        }
        if include_sesiones:
            data["sesiones"] = [s.to_dict() for s in self.sesiones]
        return data

    def __repr__(self) -> str:
        return f"<Sala {self.id} – {self.nombre} [{self.estado}]>"


class Sesion(db.Model):
    __tablename__ = "sesiones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sala_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("salas.id", ondelete="CASCADE"), nullable=False
    )
    estado: Mapped[str] = mapped_column(String(50), default="activa")
    fecha_inicio: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    fecha_fin: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    notas_sesion: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    grabacion_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    sala: Mapped["Sala"] = relationship("Sala", back_populates="sesiones")
    participantes: Mapped[List["Participante"]] = relationship(
        "Participante",
        back_populates="sesion",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def __init__(
        self,
        sala_id: int,
        estado: str = "activa",
    ) -> None:
        self.sala_id = sala_id
        self.estado = estado

    def to_dict(self, include_participantes: bool = False) -> dict:
        data: dict = {
            "id":            self.id,
            "sala_id":       self.sala_id,
            "estado":        self.estado,
            "fecha_inicio":  (
                self.fecha_inicio.isoformat() if self.fecha_inicio else None
            ),
            "fecha_fin":     self.fecha_fin.isoformat() if self.fecha_fin else None,
            "duracion_min":  self._duracion_minutos(),
            "notas_sesion":  self.notas_sesion,
            "grabacion_url": self.grabacion_url,
        }
        if include_participantes:
            data["participantes"] = [p.to_dict() for p in self.participantes]
        return data

    def _duracion_minutos(self) -> Optional[float]:
        if not self.fecha_fin or not self.fecha_inicio:
            return None
        delta = self.fecha_fin - self.fecha_inicio
        return round(delta.total_seconds() / 60, 1)

    def __repr__(self) -> str:
        return f"<Sesion {self.id} – sala {self.sala_id} [{self.estado}]>"


class Participante(db.Model):
    __tablename__ = "participantes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sesion_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("sesiones.id", ondelete="CASCADE"), nullable=False
    )
    usuario_id: Mapped[int] = mapped_column(Integer, nullable=False)
    nombre_usuario: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    rol: Mapped[str] = mapped_column(String(50), nullable=False)
    fecha_ingreso: Mapped[Optional[datetime]] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )
    fecha_salida: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    sesion: Mapped["Sesion"] = relationship("Sesion", back_populates="participantes")

    def __init__(
        self,
        sesion_id: int,
        usuario_id: int,
        rol: str,
        nombre_usuario: Optional[str] = None,
        activo: bool = True,
    ) -> None:
        self.sesion_id = sesion_id
        self.usuario_id = usuario_id
        self.rol = rol
        self.nombre_usuario = nombre_usuario
        self.activo = activo

    def to_dict(self) -> dict:
        return {
            "id":             self.id,
            "sesion_id":      self.sesion_id,
            "usuario_id":     self.usuario_id,
            "nombre_usuario": self.nombre_usuario,
            "rol":            self.rol,
            "fecha_ingreso":  (
                self.fecha_ingreso.isoformat() if self.fecha_ingreso else None
            ),
            "fecha_salida": (
                self.fecha_salida.isoformat() if self.fecha_salida else None
            ),
            "activo": self.activo,
        }

    def __repr__(self) -> str:
        return (
            f"<Participante usuario={self.usuario_id} "
            f"sesion={self.sesion_id} [{self.rol}]>"
        )