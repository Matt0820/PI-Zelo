"""Configuração de testes com banco temporário e segredo sintético."""

from __future__ import annotations

import os
import tempfile
import uuid
from pathlib import Path

# Definir antes de importar a aplicação garante que nenhum teste use o banco
# configurado para desenvolvimento ou produção.
TEST_DATABASE_PATH = Path(tempfile.gettempdir()) / f"zelo-tests-{uuid.uuid4().hex}.sqlite3"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DATABASE_PATH.as_posix()}"
os.environ["ZELO_AUTH_SECRET"] = "test-only-secret-not-for-production"
os.environ["ZELO_CORS_ORIGINS"] = "http://testserver"

import pytest

from app.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def isolated_database():
    """Cria o esquema em SQLite temporário e o remove ao fim da suíte."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    TEST_DATABASE_PATH.unlink(missing_ok=True)
