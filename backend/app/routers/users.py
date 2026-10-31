"""Rotas de listagem e consulta de usuários."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.seed import seed_initial_data


router = APIRouter()


@router.post('/api/seed', status_code=status.HTTP_200_OK)
def trigger_seed(db: Annotated[Session, Depends(get_db)]) -> dict:
    seed_initial_data(db)
    return {"message": "Base de dados verificada e populada com sucesso."}


@router.get('/api/users', response_model=list[UserResponse])
def list_users(
    perfil: str | None = None,
    db: Annotated[Session, Depends(get_db)] = None,
) -> list[User]:
    stmt = select(User)
    if perfil:
        stmt = stmt.where(User.perfil == perfil)
    return db.scalars(stmt).all()


@router.get('/api/users/{user_id}', response_model=UserResponse)
def get_user(user_id: int, db: Annotated[Session, Depends(get_db)]) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuario nao encontrado.')
    return user
