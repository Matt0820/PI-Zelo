import logging
import os
import subprocess
import sys
from pathlib import Path

import pytest

from app.config import _is_weak_auth_secret, _resolve_auth_secret


def test_development_generates_temporary_secret_and_warns(caplog):
    with caplog.at_level(logging.WARNING):
        first = _resolve_auth_secret("development", None)
        second = _resolve_auth_secret("development", "")

    assert len(first) >= 32
    assert first != second
    assert "ZELO_AUTH_SECRET não definido" in caplog.text
    assert "As sessões serão invalidadas" in caplog.text


def test_development_warns_for_weak_configured_secret(caplog):
    with caplog.at_level(logging.WARNING):
        secret = _resolve_auth_secret("development", "short-secret")

    assert secret == "short-secret"
    assert "ZELO_AUTH_SECRET parece fraco" in caplog.text


@pytest.mark.parametrize(
    "secret",
    [None, "", "short-secret", "change-me-placeholder-secret-that-is-long-enough"],
)
def test_production_rejects_missing_weak_and_example_secrets(secret):
    with pytest.raises(RuntimeError, match="ZELO_AUTH_SECRET"):
        _resolve_auth_secret("production", secret)


def test_production_accepts_a_long_non_placeholder_secret():
    secret = "A1b2C3d4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0"

    assert not _is_weak_auth_secret(secret)
    assert _resolve_auth_secret("prod", secret) == secret


def test_production_import_fails_when_secret_is_missing():
    backend_path = Path(__file__).resolve().parents[1]
    environment = {
        "PATH": os.environ.get("PATH", ""),
        "PYTHONPATH": str(backend_path),
        "APP_ENV": "production",
        "ZELO_AUTH_SECRET": "",
    }

    result = subprocess.run(
        [sys.executable, "-c", "import app.config"],
        cwd=backend_path,
        env=environment,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode != 0
    assert "ZELO_AUTH_SECRET é obrigatório" in result.stderr
