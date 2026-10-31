from pathlib import Path
import tempfile

from app.database import engine
from app.time_utils import utc_now


def test_uses_temporary_sqlite_database():
    database_path = Path(engine.url.database or "")

    assert engine.url.drivername == "sqlite"
    assert database_path.parent == Path(tempfile.gettempdir())
    assert database_path.name.startswith("zelo-tests-")


def test_utc_clock_returns_timezone_aware_datetime():
    current_time = utc_now()

    assert current_time.tzinfo is not None
    assert current_time.utcoffset().total_seconds() == 0
