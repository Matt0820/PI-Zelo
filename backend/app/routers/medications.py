"""Rotas de medicamentos, doses de resgate e orientações."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import CatalogMedication, Medication, Orientation, User
from app.schemas import (
    CatalogMedicationCreate,
    CatalogMedicationResponse,
    CatalogMedicationUpdate,
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


@router.delete('/api/users/{user_id}/medications/{med_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_medication(
    user_id: int,
    med_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> None:
    med = db.get(Medication, med_id)
    if not med or med.user_id != user_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicamento nao encontrado.')
    db.delete(med)
    db.commit()


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



# ==========================================
# CATÁLOGO DE MEDICAMENTOS INSTITUCIONAL (RENAME / CUIDADOS PALIATIVOS)
# ==========================================

@router.get('/api/catalog/medications', response_model=list[CatalogMedicationResponse])
def list_catalog_medications(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
    sintoma_alvo: str | None = None,
    apenas_ativos: bool = True,
) -> list[CatalogMedication]:
    """Lista medicamentos padronizados no catálogo institucional."""
    stmt = select(CatalogMedication)
    if apenas_ativos:
        stmt = stmt.where(CatalogMedication.ativo == True)
    if sintoma_alvo:
        stmt = stmt.where(CatalogMedication.sintoma_alvo.ilike(f'%{sintoma_alvo}%'))
    if search:
        search_term = f'%{search}%'
        stmt = stmt.where(
            (CatalogMedication.nome.ilike(search_term))
            | (CatalogMedication.principio_ativo.ilike(search_term))
            | (CatalogMedication.sintoma_alvo.ilike(search_term))
        )
    stmt = stmt.order_by(CatalogMedication.nome.asc())
    return list(db.scalars(stmt).all())


@router.post(
    '/api/catalog/medications',
    response_model=CatalogMedicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_catalog_medication(
    payload: CatalogMedicationCreate,
    db: Annotated[Session, Depends(get_db)],
) -> CatalogMedication:
    """Médico ou equipe assistencial cadastra novo medicamento no catálogo institucional."""
    med = CatalogMedication(
        nome=payload.nome.strip(),
        principio_ativo=payload.principio_ativo.strip() if payload.principio_ativo else None,
        via_administracao=payload.via_administracao.strip(),
        dose_padrao=payload.dose_padrao.strip(),
        frequencia_padrao=payload.frequencia_padrao.strip(),
        eh_dose_resgate=payload.eh_dose_resgate,
        sintoma_alvo=payload.sintoma_alvo.strip() if payload.sintoma_alvo else None,
        orientacoes_padrao=payload.orientacoes_padrao.strip() if payload.orientacoes_padrao else None,
        ativo=payload.ativo,
    )
    db.add(med)
    db.commit()
    db.refresh(med)
    return med


@router.patch(
    '/api/catalog/medications/{med_id}',
    response_model=CatalogMedicationResponse,
)
def update_catalog_medication(
    med_id: int,
    payload: CatalogMedicationUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> CatalogMedication:
    """Atualiza dados ou posologia de um medicamento do catálogo."""
    med = db.get(CatalogMedication, med_id)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicamento do catálogo não encontrado.')

    if payload.nome is not None:
        med.nome = payload.nome.strip()
    if payload.principio_ativo is not None:
        med.principio_ativo = payload.principio_ativo.strip() or None
    if payload.via_administracao is not None:
        med.via_administracao = payload.via_administracao.strip()
    if payload.dose_padrao is not None:
        med.dose_padrao = payload.dose_padrao.strip()
    if payload.frequencia_padrao is not None:
        med.frequencia_padrao = payload.frequencia_padrao.strip()
    if payload.eh_dose_resgate is not None:
        med.eh_dose_resgate = payload.eh_dose_resgate
    if payload.sintoma_alvo is not None:
        med.sintoma_alvo = payload.sintoma_alvo.strip() or None
    if payload.orientacoes_padrao is not None:
        med.orientacoes_padrao = payload.orientacoes_padrao.strip() or None
    if payload.ativo is not None:
        med.ativo = payload.ativo

    db.commit()
    db.refresh(med)
    return med


@router.delete(
    '/api/catalog/medications/{med_id}',
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_catalog_medication(
    med_id: int,
    db: Annotated[Session, Depends(get_db)],
):
    """Desativa um medicamento do catálogo institucional."""
    med = db.get(CatalogMedication, med_id)
    if not med:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Medicamento do catálogo não encontrado.')

    med.ativo = False
    db.commit()
    return None
