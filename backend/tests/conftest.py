"""Configuração de testes com banco temporário e segredo sintético."""

from __future__ import annotations

import asyncio
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
import fastapi.routing
import anyio.to_thread


async def _run_sync_endpoint_inline(
    func, *args, limiter=None, abandon_on_cancel=False, cancellable=None, **kwargs
):
    """Evita o worker thread do anyio, indisponível neste sandbox de execução."""
    return func(*args, **kwargs)


# Os endpoints atuais são síncronos. Neste ambiente, `anyio.to_thread` bloqueia
# indefinidamente; executá-los inline mantém o teste HTTP sem alterar a aplicação.
fastapi.routing.run_in_threadpool = _run_sync_endpoint_inline
anyio.to_thread.run_sync = _run_sync_endpoint_inline

from app.main import app  # Registra os modelos ORM e fornece o alvo do cliente ASGI.
from app.database import Base, engine


@pytest.fixture(scope="session", autouse=True)
def isolated_database():
    """Cria o esquema em SQLite temporário e o remove ao fim da suíte."""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    engine.dispose()
    TEST_DATABASE_PATH.unlink(missing_ok=True)


@pytest.fixture
def client():
    """Cliente ASGI síncrono para testes, sem iniciar lifespan ou seed real."""
    import httpx

    class SyncASGIClient:
        async def _request(self, method, path, **kwargs):
            transport = httpx.ASGITransport(app=app)
            async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as session:
                return await session.request(method, path, **kwargs)

        def request(self, method, path, **kwargs):
            return asyncio.run(self._request(method, path, **kwargs))

        def get(self, path, **kwargs):
            return self.request("GET", path, **kwargs)

        def post(self, path, **kwargs):
            return self.request("POST", path, **kwargs)

        def patch(self, path, **kwargs):
            return self.request("PATCH", path, **kwargs)

        def put(self, path, **kwargs):
            return self.request("PUT", path, **kwargs)

        def delete(self, path, **kwargs):
            return self.request("DELETE", path, **kwargs)

    return SyncASGIClient()
