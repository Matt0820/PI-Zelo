"""Camada de acesso ao banco de dados do projeto.

As sessões do SQLAlchemy são criadas aqui para que todos os endpoints e
modelos compartilhem a mesma conexão e o mesmo padrão de gestão de transações.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """Classe base para todos os modelos ORM da aplicação."""

    pass


# A engine do banco é inicializada apenas uma vez e reutilizada pela aplicação.
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def get_db():
    """Cria uma sessão de banco por requisição e fecha ao final.

    O padrão `yield` permite que a sessão seja injetada automaticamente nos
    endpoints do FastAPI e seja fechada corretamente após o uso.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
