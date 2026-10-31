from pathlib import Path
import tempfile

from app.database import engine


def test_uses_temporary_sqlite_database():
    database_path = Path(engine.url.database or "")

    assert engine.url.drivername == "sqlite"
    assert database_path.parent == Path(tempfile.gettempdir())
    assert database_path.name.startswith("zelo-tests-")
