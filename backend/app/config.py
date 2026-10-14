import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


class Settings:
    APP_NAME: str = os.getenv('APP_NAME', 'Zelo API')
    APP_VERSION: str = os.getenv('APP_VERSION', '1.0.0')
    APP_DESCRIPTION: str = os.getenv(
        'APP_DESCRIPTION',
        'Backend do app Zelo para cuidado e acompanhamento.',
    )
    DATABASE_URL: str = os.getenv(
        'DATABASE_URL',
        'mysql+pymysql://zelo_user:Zelo123!@localhost:3306/zelo_db?charset=utf8mb4',
    )


settings = Settings()
