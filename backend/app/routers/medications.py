"""Rotas de medicamentos, doses de resgate e orientações."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Medication, Orientation, User
from app.schemas import (
    MedicationCreate,
    MedicationResponse,
    MedicationUpdate,
    OrientationCreate,
    OrientationResponse,
    RescueDoseCreate,
)


router = APIRouter()


@router.post('/api/users/{user_id}/medications', response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def create_medication(
    user_id: int,
    payload: MedicationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    med = Medication(
        user_id=user_id,
        nome=payload.nome,
        dose=payload.dose,
        horario=payload.horario,
        frequencia=payload.frequencia,
        observacao=payload.observacao,
        status=payload.status,
        eh_dose_resgate=payload.eh_dose_resgate,
        medico_prescritor=payload.medico_prescritor,
        vigencia=payload.vigencia,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.post('/api/users/{user_id}/rescue-doses', response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
def record_rescue_dose(
    user_id: int,
    payload: RescueDoseCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    """Paciente registra uma dose de resgate já tomada, sem criar prescrição."""
    if not db.get(User, user_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')
    nome = payload.nome.strip()
    if not nome:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Informe o medicamento de resgate.')
    observacao = payload.observacao.strip() if payload.observacao else None
    med = Medication(
        user_id=user_id,
        nome=nome,
        dose='1 dose de resgate SOS',
        horario=payload.horario,
        frequencia='Uso pontual para crise aguda de dor',
        observacao=observacao or None,
        status='tomada',
        eh_dose_resgate=True,
        medico_prescritor='Prescrição de resgate domiciliar',
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.get('/api/users/{user_id}/medications', response_model=list[MedicationResponse])
def list_medications(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Medication]:
    return db.scalars(select(Medication).where(Medication.user_id == user_id)).all()


@router.post('/api/users/{user_id}/medications/{med_id}/confirm', response_model=MedicationResponse)
def confirm_medication_taken(
    user_id: int,
    med_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    med = db.scalar(select(Medication).where(Medication.id == med_id, Medication.user_id == user_id))
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicação não encontrada.')
    med.status = 'tomada'
    db.commit()
    db.refresh(med)
    return med


@router.post('/api/users/{user_id}/medications/{med_id}/undo-confirmation', response_model=MedicationResponse)
def undo_medication_taken_confirmation(
    user_id: int,
    med_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    med = db.scalar(select(Medication).where(Medication.id == med_id, Medication.user_id == user_id))
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicação não encontrada.')
    med.status = 'ativo'
    db.commit()
    db.refresh(med)
    return med


@router.patch('/api/users/{user_id}/medications/{med_id}', response_model=MedicationResponse)
def update_medication(
    user_id: int,
    med_id: int,
    payload: MedicationUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> Medication:
    med = db.scalar(select(Medication).where(Medication.id == med_id, Medication.user_id == user_id))
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicação não encontrada.')
    if payload.nome is not None:
        med.nome = payload.nome
    if payload.dose is not None:
        med.dose = payload.dose
    if payload.horario is not None:
        med.horario = payload.horario
    if payload.frequencia is not None:
        med.frequencia = payload.frequencia
    if payload.observacao is not None:
        med.observacao = payload.observacao
    if payload.status is not None:
        med.status = payload.status
    if payload.eh_dose_resgate is not None:
        med.eh_dose_resgate = payload.eh_dose_resgate
    if payload.medico_prescritor is not None:
        med.medico_prescritor = payload.medico_prescritor
    if payload.vigencia is not None:
        med.vigencia = payload.vigencia
    db.commit()
    db.refresh(med)
    return med


@router.post('/api/users/{user_id}/orientations', response_model=OrientationResponse, status_code=status.HTTP_201_CREATED)
def create_orientation(
    user_id: int,
    payload: OrientationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Orientation:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    orientation = Orientation(
        user_id=user_id,
        titulo=payload.titulo,
        descricao=payload.descricao,
        categoria=payload.categoria,
        prioridade=payload.prioridade,
    )
    db.add(orientation)
    db.commit()
    db.refresh(orientation)
    return orientation


@router.get('/api/users/{user_id}/orientations', response_model=list[OrientationResponse])
def list_orientations(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Orientation]:
    return db.scalars(select(Orientation).where(Orientation.user_id == user_id)).all()
