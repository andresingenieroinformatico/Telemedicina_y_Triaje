"""
jitsi_service.py – Jitsi Meet Integration Service
===================================================
Genera URLs de acceso a salas de Jitsi Meet en modo público (meet.jit.si).
No requiere autenticación ni tokens — la URL es suficiente para unirse.

Configuración via .env:
  JITSI_SERVER_URL  URL base de Jitsi (default: https://meet.jit.si)
"""

import os
import re
from datetime import datetime, timezone, timedelta

# ─── Configuración ─────────────────────────────────────────────────────────────
JITSI_SERVER_URL = os.getenv("JITSI_SERVER_URL", "https://meet.jit.si")


# ─────────────────────────────────────────────────────────────────────────────
# Funciones públicas
# ─────────────────────────────────────────────────────────────────────────────

def generate_room_name(sala_id: int, nombre: str) -> str:
    """
    Genera un nombre de sala limpio y único para Jitsi.

    Ejemplo:
        generate_room_name(3, "Consulta Cardiología")
        → "telemedicina-consulta-cardiologia-3"
    """
    nombre_limpio = nombre.lower()

    # Normalizar tildes y caracteres especiales del español
    _replacements = {
        'á': 'a', 'à': 'a', 'ä': 'a', 'â': 'a',
        'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
        'í': 'i', 'ì': 'i', 'ï': 'i', 'î': 'i',
        'ó': 'o', 'ò': 'o', 'ö': 'o', 'ô': 'o',
        'ú': 'u', 'ù': 'u', 'ü': 'u', 'û': 'u',
        'ñ': 'n', 'ç': 'c',
    }
    for char, replacement in _replacements.items():
        nombre_limpio = nombre_limpio.replace(char, replacement)

    # Eliminar caracteres no permitidos, colapsar espacios en guiones
    nombre_limpio = re.sub(r'[^a-z0-9\s-]', '', nombre_limpio)
    nombre_limpio = re.sub(r'\s+', '-', nombre_limpio.strip())
    nombre_limpio = re.sub(r'-+', '-', nombre_limpio)[:50].rstrip('-')

    return f"telemedicina-{nombre_limpio}-{sala_id}"


def generate_jitsi_url(room_name: str) -> str:
    """
    Genera la URL pública de una sala en el servidor Jitsi configurado.

    Ejemplo:
        generate_jitsi_url("telemedicina-consulta-3")
        → "https://meet.jit.si/telemedicina-consulta-3"
    """
    base = JITSI_SERVER_URL.rstrip("/")
    return f"{base}/{room_name}"


def generate_meeting_link(
    sala,
    usuario_id: int,
    nombre_usuario: str,
    rol: str,
) -> dict:
    """
    Genera la información de acceso a una sala de Jitsi Meet (modo público).

    Args:
        sala:            Objeto Sala (debe tener jitsi_room_name o se genera al vuelo)
        usuario_id:      ID del usuario que accede
        nombre_usuario:  Nombre a mostrar en la videollamada
        rol:             'medico' | 'paciente' | 'admin'

    Returns:
        dict con:
          - url_acceso     → URL para abrir en navegador o iframe
          - room_name      → Nombre de la sala en Jitsi
          - es_moderador   → True si rol es médico o admin
          - config_iframe  → Objeto de configuración para Jitsi iframe API (frontend)
    """
    # Obtener o generar el room_name (fallback si sala antigua no tiene jitsi_room_name)
    room_name = sala.jitsi_room_name or generate_room_name(sala.id, sala.nombre)
    url_acceso = generate_jitsi_url(room_name)
    is_moderator = rol in {"medico", "admin"}

    return {
        "sala_id":        sala.id,
        "sala_nombre":    sala.nombre,
        "room_name":      room_name,
        "url_acceso":     url_acceso,
        "es_moderador":   is_moderator,
        "rol":            rol,
        "servidor_jitsi": JITSI_SERVER_URL,
        # Configuración para embeber Jitsi iframe API en el frontend
        "config_iframe": {
            "domain":   _extract_host(JITSI_SERVER_URL),
            "roomName": room_name,
            "userInfo": {
                "displayName": nombre_usuario or f"Usuario {usuario_id}",
            },
            "configOverwrite": {
                "startWithAudioMuted": not is_moderator,
                "startWithVideoMuted": False,
                "enableClosePage":     True,
            },
            "interfaceConfigOverwrite": {
                "SHOW_JITSI_WATERMARK":      False,
                "SHOW_WATERMARK_FOR_GUESTS": False,
                "TOOLBAR_BUTTONS":           _get_toolbar_buttons(rol),
            },
        },
    }


# ─────────────────────────────────────────────────────────────────────────────
# Helpers privados
# ─────────────────────────────────────────────────────────────────────────────

def _extract_host(url: str) -> str:
    """Extrae el hostname de una URL. Ej: 'https://meet.jit.si' → 'meet.jit.si'"""
    url = url.rstrip("/")
    if "://" in url:
        return url.split("://", 1)[1]
    return url


def _get_toolbar_buttons(rol: str) -> list:
    """Retorna los botones del toolbar de Jitsi según el rol del usuario."""
    base_buttons = [
        "camera", "chat", "closedcaptions", "desktop",
        "filmstrip", "hangup", "microphone", "participants-pane",
        "raisehand", "tileview", "toggle-camera",
    ]
    moderator_extra = [
        "mute-everyone", "mute-video-everyone", "security",
        "select-background", "settings", "stats",
    ]
    return base_buttons + moderator_extra if rol in {"medico", "admin"} else base_buttons
