from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    sintomas: Mapped[list['Symptom']] = relationship(back_populates='usuario')
    medicacoes: Mapped[list['Medication']] = relationship(back_populates='usuario')
    orientacoes: Mapped[list['Orientation']] = relationship(back_populates='usuario')


class Symptom(Base):
    __tablename__ = 'symptoms'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    gravidade: Mapped[str] = mapped_column(String(20), nullable=False)
    momento: Mapped[str] = mapped_column(String(100), nullable=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='sintomas')


class Medication(Base):
    __tablename__ = 'medications'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    dose: Mapped[str] = mapped_column(String(100), nullable=False)
    horario: Mapped[str] = mapped_column(String(50), nullable=False)
    frequencia: Mapped[str] = mapped_column(String(80), nullable=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='medicacoes')


class Orientation(Base):
    __tablename__ = 'orientations'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), nullable=False)
    prioridade: Mapped[str] = mapped_column(String(20), nullable=False)
    atualizada_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='orientacoes')
