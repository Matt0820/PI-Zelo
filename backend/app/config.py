"""Configurações centralizadas do backend do Zelo.

Centraliza as variáveis de ambiente com suporte a SQLite local
e MySQL em ambiente de produção.
"""

import os
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


settings = Settings()
