"""Rotas públicas de cadastro e autenticação."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import AuthResponse, UserCreate, UserLogin
from app.security import _hash_password, _make_access_token, _verify_password


router = APIRouter()


@router.post('/api/users', response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Annotated[Session, Depends(get_db)]) -> dict:
    if payload.perfil != 'paciente':
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='O cadastro público permite criar apenas contas de paciente.')
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Ja existe um usuario com este e-mail.',
        )

    user = User(
        nome=payload.nome,
        email=str(payload.email),
        senha_hash=_hash_password(payload.senha),
        perfil='paciente',
        prontuario=payload.prontuario,
        idade=payload.idade,
        sexo=payload.sexo,
        cpf=payload.cpf,
        telefone=payload.telefone,
        cuidador_principal=payload.cuidador_principal,
        parentesco_cuidador=payload.parentesco_cuidador,
        diagnostico_oncologico=payload.diagnostico_oncologico,
        pps_score=payload.pps_score,
        comorbidades=payload.comorbidades,
        alergias=payload.alergias,
        proxima_consulta=payload.proxima_consulta,
        tratamento_modificador=payload.tratamento_modificador,
        ativo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {'user': user, 'access_token': _make_access_token(user)}


@router.post('/api/auth/login', response_model=AuthResponse)
@router.post('/api/login', response_model=AuthResponse)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]) -> dict:
    identificador = payload.email.strip()
    cpf_digits = ''.join(c for c in identificador if c.isdigit())
    cpf_formatado = f"{cpf_digits[:3]}.{cpf_digits[3:6]}.{cpf_digits[6:9]}-{cpf_digits[9:]}" if len(cpf_digits) == 11 else None

    identificador_conditions = [
        User.email.ilike(identificador),
        User.prontuario.ilike(identificador),
    ]
    if cpf_formatado:
        identificador_conditions.extend(
            (User.cpf == identificador, User.cpf == cpf_formatado)
        )

    user = db.scalar(
        select(User).where(or_(*identificador_conditions))
    )
    valid_password, needs_migration = _verify_password(payload.senha, user.senha_hash) if user else (False, False)
    if not user or not user.ativo or not valid_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Credenciais invalidas. Verifique o identificador e a senha.',
        )
    if needs_migration:
        user.senha_hash = _hash_password(payload.senha)
        db.commit()
        db.refresh(user)
    return {'user': user, 'access_token': _make_access_token(user)}
