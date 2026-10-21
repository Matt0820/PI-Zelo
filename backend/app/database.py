"""Camada de acesso ao banco de dados do projeto Zelo.

As sessões do SQLAlchemy são criadas aqui para que todos os endpoints e
modelos compartilhem a mesma conexão e o mesmo padrão de gestão de transações.
Suporta SQLite (com check_same_thread desabilitado) e MySQL com pool_pre_ping.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Classe base para todos os modelos ORM da aplicação."""
    pass


# Configura argumentos adicionais para SQLite se necessário
engine_kwargs = {"future": True}
if settings.DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True

engine = create_engine(settings.DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    """Cria uma sessão de banco por requisição e fecha ao final."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
