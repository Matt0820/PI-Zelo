"""API principal do projeto Zelo.

Este módulo expõe os endpoints usados pelo protótipo web e pelo aplicativo
mobile para gerenciar usuários, sintomas, medicamentos e orientações.
A organização das rotas foi pensada para facilitar manutenção e para manter a
persistência centralizada em um único backend.
"""

import hashlib
import hmac
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db
from app.models import Medication, Orientation, Symptom, User
from app.schemas import (
    HealthResponse,
    MedicationCreate,
    MedicationResponse,
    OrientationCreate,
    OrientationResponse,
    SymptomCreate,
    SymptomResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=settings.APP_DESCRIPTION,
    swagger_ui_parameters={"persistAuthorization": True},
)

# A API é consumida por clientes web e mobile, por isso a CORS é liberada em modo
de desenvolvimento para manter a integração simples.
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.on_event('startup')
def startup() -> None:
    """Garante que as tabelas estejam criadas ao iniciar a aplicação."""
    Base.metadata.create_all(bind=engine)


@app.get('/health', response_model=HealthResponse)
def health_check(db: Annotated[Session, Depends(get_db)]) -> dict:
    """Valida se a aplicação e o banco MySQL estão funcionando."""
    try:
        db.execute(text('SELECT 1'))
        return {'status': 'ok', 'database': 'mysql'}
    except Exception as exc:  # pragma: no cover - depende do ambiente local
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f'Database indisponível: {exc}',
        ) from exc


@app.post('/api/users', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Annotated[Session, Depends(get_db)]) -> User:
    """Cria um novo usuário e persiste o hash da senha."""
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Já existe um usuário com este e-mail.',
        )

    # O hash é gerado em texto puro para evitar armazenar senha em claro.
    user = User(
        nome=payload.nome,
        email=str(payload.email),
        senha_hash=hashlib.sha256(payload.senha.encode('utf-8')).hexdigest(),
        ativo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post('/api/auth/login', response_model=UserResponse)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]) -> User:
    """Valida o login do usuário com comparação segura do hash."""
    user = db.scalar(select(User).where(User.email == str(payload.email)))
    senha_hash = hashlib.sha256(payload.senha.encode('utf-8')).hexdigest()
    if not user or not user.ativo or not hmac.compare_digest(user.senha_hash, senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Email ou senha inválidos.',
        )
    return user


@app.get('/api/users', response_model=list[UserResponse])
def list_users(db: Annotated[Session, Depends(get_db)]) -> list[User]:
    """Lista todos os usuários cadastrados."""
    return db.scalars(select(User)).all()


@app.get('/api/users/{user_id}', response_model=UserResponse)
def get_user(user_id: int, db: Annotated[Session, Depends(get_db)]) -> User:
    """Retorna um usuário específico pelo identificador."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')
    return user


@app.post('/api/users/{user_id}/symptoms', response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
def create_symptom(
    user_id: int,
    payload: SymptomCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Symptom:
    """Cria um sintoma vinculado ao usuário informado."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')

    symptom = Symptom(
        nome=payload.nome,
        gravidade=payload.gravidade,
        momento=payload.momento,
        observacao=payload.observacao,
        user_id=user_id,
    )
    db.add(symptom)
    db.commit()
    db.refresh(symptom)
    return symptom


@app.get('/api/users/{user_id}/symptoms', response_model=list[SymptomResponse])
def list_symptoms(user_id: int, db: Annotated[Session, Depends(get_db)]) -> list[Symptom]:
    """Lista sintomas de um usuário específico."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')
    return db.scalars(select(Symptom).where(Symptom.user_id == user_id)).all()


@app.post('/api/users/{user_id}/medications', response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(
    user_id: int,
    payload: MedicationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    """Cria um medicamento vinculado ao usuário."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')

    medication = Medication(
        nome=payload.nome,
        dose=payload.dose,
        horario=payload.horario,
        frequencia=payload.frequencia,
        observacao=payload.observacao,
        status=payload.status,
        user_id=user_id,
    )
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication


@app.get('/api/users/{user_id}/medications', response_model=list[MedicationResponse])
def list_medications(user_id: int, db: Annotated[Session, Depends(get_db)]) -> list[Medication]:
    """Lista medicamentos cadastrados para um usuário."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')
    return db.scalars(select(Medication).where(Medication.user_id == user_id)).all()


@app.post('/api/users/{user_id}/orientations', response_model=OrientationResponse, status_code=status.HTTP_201_CREATED)
def create_orientation(
    user_id: int,
    payload: OrientationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Orientation:
    """Cria uma orientação vinculada ao usuário."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')

    orientation = Orientation(
        titulo=payload.titulo,
        descricao=payload.descricao,
        categoria=payload.categoria,
        prioridade=payload.prioridade,
        user_id=user_id,
    )
    db.add(orientation)
    db.commit()
    db.refresh(orientation)
    return orientation


@app.get('/api/users/{user_id}/orientations', response_model=list[OrientationResponse])
def list_orientations(user_id: int, db: Annotated[Session, Depends(get_db)]) -> list[Orientation]:
    """Lista orientações cadastradas para um usuário."""
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuário não encontrado.')
    return db.scalars(select(Orientation).where(Orientation.user_id == user_id)).all()


@app.get('/')
def root() -> dict:
    """Endpoint inicial com links para documentação da API."""
    return {
        'message': 'Zelo API ativa',
        'docs': '/docs',
        'swagger': '/openapi.json',
    }
