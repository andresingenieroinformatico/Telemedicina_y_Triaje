"""
jitsi_service.py – Jitsi Meet Integration Service
===================================================
Genera URLs de acceso a salas de Jitsi Meet en modo público (meet.jit.si).
No requiere autenticación ni tokens — la URL es suficiente para unirse.

Configuración via env:
  JITSI_SERVER_URL  URL base de Jitsi (default: https://meet.jit.si)
"""

import os
import re

# ─── Configuración ─────────────────────────────────────────────────────────────
JITSI_SERVER_URL = os.getenv("JITSI_SERVER_URL", "https://meet.jit.si")


def generate_room_name(sala_id: int, nombre: str) -> str:
    """
    Genera un nombre de sala limpio y único para Jitsi.

    Ejemplo:
        generate_room_name(3, "Consulta Cardiología")
        → "telemedicina-consulta-cardiologia-3"
    """
    nombre_limpio = nombre.lower()

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

    nombre_limpio = re.sub(r'[^a-z0-9\s-]', '', nombre_limpio)
    nombre_limpio = re.sub(r'\s+', '-', nombre_limpio.strip())
    nombre_limpio = re.sub(r'-+', '-', nombre_limpio)[:50].rstrip('-')

    return f"telemedicina-{nombre_limpio}-{sala_id}"


def generate_jitsi_url(room_name: str) -> str:
    """Genera la URL pública de una sala en el servidor Jitsi configurado."""
    base = JITSI_SERVER_URL.rstrip("/")
    return f"{base}/{room_name}"


def generate_meeting_link_simple(
    sala_id: int,
    nombre_sala: str,
    usuario_id: int,
    nombre_usuario: str,
    rol: str,
) -> dict:
    """
    Genera la información de acceso a una sala de Jitsi Meet (sin BD).

    Returns dict con url_acceso, room_name, es_moderador, config_iframe.
    """
    room_name  = generate_room_name(sala_id, nombre_sala)
    url_acceso = generate_jitsi_url(room_name)
    is_moderator = rol in {"medico", "admin"}

    return {
        "sala_id":        sala_id,
        "sala_nombre":    nombre_sala,
        "room_name":      room_name,
        "url_acceso":     url_acceso,
        "es_moderador":   is_moderator,
        "rol":            rol,
        "servidor_jitsi": JITSI_SERVER_URL,
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


def _extract_host(url: str) -> str:
    url = url.rstrip("/")
    if "://" in url:
        return url.split("://", 1)[1]
    return url


def _get_toolbar_buttons(rol: str) -> list:
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
