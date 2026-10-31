"""Configurações centralizadas do backend do Zelo.

Centraliza as variáveis de ambiente com suporte a SQLite local
e MySQL em ambiente de produção.
"""

import os
import logging
import secrets
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')

_MIN_AUTH_SECRET_LENGTH = 32
_AUTH_SECRET_PLACEHOLDERS = (
    'change-me',
    'changeme',
    'your-secret',
    'replace-me',
    'insecure',
    'password',
    'test-only',
    'dev-secret',
)
logger = logging.getLogger(__name__)


def _is_weak_auth_secret(secret: str) -> bool:
    normalized = secret.strip().lower()
    return (
        len(secret.encode('utf-8')) < _MIN_AUTH_SECRET_LENGTH
        or len(set(secret)) < 12
        or any(placeholder in normalized for placeholder in _AUTH_SECRET_PLACEHOLDERS)
    )


def _resolve_auth_secret(app_env: str, configured_secret: str | None) -> str:
    environment = app_env.strip().lower()
    is_production = environment in {'production', 'prod'}
    secret = configured_secret.strip() if configured_secret else ''

    if is_production:
        if not secret:
            raise RuntimeError('ZELO_AUTH_SECRET é obrigatório quando APP_ENV=production.')
        if _is_weak_auth_secret(secret):
            raise RuntimeError(
                'ZELO_AUTH_SECRET fraco: use ao menos 32 caracteres aleatórios e não use valores de exemplo.'
            )
        return secret

    if not secret:
        logger.warning(
            'ZELO_AUTH_SECRET não definido; foi gerado um segredo temporário para desenvolvimento. '
            'As sessões serão invalidadas quando a aplicação reiniciar.'
        )
        return secrets.token_urlsafe(48)

    if _is_weak_auth_secret(secret):
        logger.warning('ZELO_AUTH_SECRET parece fraco; use um valor aleatório com pelo menos 32 caracteres.')
    return secret


class Settings:
    """Armazena as configurações globais da aplicação."""

    APP_NAME: str = os.getenv('APP_NAME', 'Zelo API')
    APP_ENV: str = os.getenv('APP_ENV', 'development').strip().lower()
    APP_VERSION: str = os.getenv('APP_VERSION', '2.0.0')
    APP_DESCRIPTION: str = os.getenv(
        'APP_DESCRIPTION',
        'Backend da plataforma Zelo para acompanhamento e triagem clínica em cuidados paliativos oncológicos.',
    )
    DATABASE_URL: str = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{BASE_DIR / "zelo.db"}',
    )
    AUTH_SECRET: str = _resolve_auth_secret(APP_ENV, os.getenv('ZELO_AUTH_SECRET'))
    AUTH_TOKEN_TTL_SECONDS: int = int(os.getenv('ZELO_AUTH_TOKEN_TTL_SECONDS', '28800'))
    CORS_ORIGINS: list[str] = [
        origin.strip()
        for origin in os.getenv(
            'ZELO_CORS_ORIGINS',
            'http://localhost:5173,http://127.0.0.1:5173',
        ).split(',')
        if origin.strip()
    ]


settings = Settings()
