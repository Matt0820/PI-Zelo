"""Configurações centralizadas do backend do Zelo.

Centraliza as variáveis de ambiente com suporte a SQLite local
e MySQL em ambiente de produção.
"""

import os
import secrets
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


class Settings:
    """Armazena as configurações globais da aplicação."""

    APP_NAME: str = os.getenv('APP_NAME', 'Zelo API')
    APP_VERSION: str = os.getenv('APP_VERSION', '2.0.0')
    APP_DESCRIPTION: str = os.getenv(
        'APP_DESCRIPTION',
        'Backend da plataforma Zelo para acompanhamento e triagem clínica em cuidados paliativos oncológicos.',
    )
    DATABASE_URL: str = os.getenv(
        'DATABASE_URL',
        f'sqlite:///{BASE_DIR / "zelo.db"}',
    )
    # In production, set a stable secret through the environment. The fallback
    # keeps local development usable and intentionally invalidates sessions on restart.
    AUTH_SECRET: str = os.getenv('ZELO_AUTH_SECRET') or secrets.token_urlsafe(48)
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
