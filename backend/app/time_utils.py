"""Helpers de data e hora para o backend."""

from datetime import datetime, timezone


def utc_now() -> datetime:
    """Retorna o instante atual com fuso UTC explícito."""
    return datetime.now(timezone.utc)
