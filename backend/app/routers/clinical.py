"""Rotas de registros clínicos, avaliações e alertas."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    ClinicalAlert,
    ClinicalNote,
    ESASAssessment,
    PainMapEntry,
    PainTriageSession,
    Symptom,
    User,
)
from app.schemas import (
    ClinicalAlertResponse,
    ClinicalAlertUpdate,
    ClinicalNoteCreate,
    ClinicalNoteResponse,
    ESASCreate,
    ESASResponse,
    PainMapCreate,
    PainMapResponse,
    PainTriageCreate,
    PainTriageResponse,
    SymptomCreate,
    SymptomResponse,
)
from app.time_utils import utc_now


router = APIRouter()


@router.post('/api/users/{user_id}/esas', response_model=ESASResponse, status_code=status.HTTP_201_CREATED)
def record_esas_assessment(
    user_id: int,
    payload: ESASCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ESASAssessment:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    scores = {
        'dor': payload.dor,
        'cansaço': payload.cansaco,
        'náusea': payload.nausea,
        'tristeza': payload.depressao,
        'ansiedade': payload.ansiedade,
        'sonolência': payload.sonolencia,
        'falta de apetite': payload.apetite,
        'mal-estar': payload.mal_estar,
        'falta de ar': payload.falta_de_ar,
        'constipação': payload.constipacao or 0,
    }
    sintoma_mais_intenso, max_score = max(scores.items(), key=lambda item: item[1])
    gravidade = 'grave' if max_score >= 7 else ('moderada' if max_score >= 4 else 'leve')
    acionou_triagem = (payload.dor >= 7)

    esas = ESASAssessment(
        user_id=user_id,
        dor=payload.dor,
        cansaco=payload.cansaco,
        nausea=payload.nausea,
        depressao=payload.depressao,
        ansiedade=payload.ansiedade,
        sonolencia=payload.sonolencia,
        apetite=payload.apetite,
        mal_estar=payload.mal_estar,
        falta_de_ar=payload.falta_de_ar,
        constipacao=payload.constipacao or 0,
        gravidade_maxima=gravidade,
        acionou_triagem_dor=acionou_triagem,
        observacao=payload.observacao,
        data_registro=utc_now(),
    )
    db.add(esas)

    if max_score >= 7:
        alerta_dor = acionou_triagem
        sintomas_graves = ', '.join(
            f'{nome} {nota}/10' for nome, nota in scores.items() if nota >= 7
        )
        alerta = ClinicalAlert(
            user_id=user_id,
            tipo_alerta='dor_grave' if alerta_dor else 'sintoma_grave',
            titulo=(
                f'Registro ESAS - Dor intensa ({payload.dor}/10)'
                if alerta_dor
                else f'Registro ESAS - {sintoma_mais_intenso.capitalize()} em intensidade alta ({max_score}/10)'
            ),
            descricao=(
                f'{user.nome} informou sintomas em intensidade alta na escala ESAS: {sintomas_graves}.'
                + (' A triagem de dor do Zelo foi acionada.' if alerta_dor else '')
            ),
            severidade='grave',
            estado='Novo',
        )
        db.add(alerta)

    db.commit()
    db.refresh(esas)
    return esas


@router.get('/api/users/{user_id}/esas', response_model=list[ESASResponse])
def get_user_esas_history(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ESASAssessment]:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')
    return db.scalars(
        select(ESASAssessment).where(ESASAssessment.user_id == user_id).order_by(desc(ESASAssessment.data_registro))
    ).all()


@router.post('/api/users/{user_id}/triagem-dor', response_model=PainTriageResponse, status_code=status.HTTP_201_CREATED)
def record_pain_triage(
    user_id: int,
    payload: PainTriageCreate,
    db: Annotated[Session, Depends(get_db)],
) -> PainTriageSession:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    tipo_calculado = 'cronica' if payload.mais_de_duas_semanas else 'aguda'

    sessao = PainTriageSession(
        user_id=user_id,
        intensidade_dor=payload.intensidade_dor,
        caracteristica_dor=payload.caracteristica_dor,
        mais_de_duas_semanas=payload.mais_de_duas_semanas,
        tipo_dor=tipo_calculado,
        fez_dose_resgate=payload.fez_dose_resgate,
        medicamentos_efetivos=payload.medicamentos_efetivos,
        em_acompanhamento=payload.em_acompanhamento,
        tem_sintoma_acompanhante=payload.tem_sintoma_acompanhante,
        sintoma_acompanhante_desc=payload.sintoma_acompanhante_desc,
        tem_fator_piora=payload.tem_fator_piora,
        fator_piora_desc=payload.fator_piora_desc,
        alerta_sinais_alarme_exibido=payload.alerta_sinais_alarme_exibido,
        medidas_nao_farmacologicas_exibidas=payload.medidas_nao_farmacologicas_exibidas,
        solicitou_agendamento=payload.solicitou_agendamento,
        status_atendimento='alerta_gerado',
        data_triagem=utc_now(),
    )
    db.add(sessao)

    desc_alerta = (
        f"Triagem Zelo: Dor {payload.intensidade_dor}/10 ({payload.caracteristica_dor.upper()}, {tipo_calculado}). "
        f"Dose de resgate: {'Sim' if payload.fez_dose_resgate else 'Nao'}. "
        f"Medicamentos efetivos: {'Sim' if payload.medicamentos_efetivos else 'Nao'}."
    )
    if payload.solicitou_agendamento:
        desc_alerta += " PACIENTE SOLICITOU AGENDAMENTO / CONTATO DA EQUIPE."

    alerta = ClinicalAlert(
        user_id=user_id,
        tipo_alerta='triagem_dor_concluida',
        titulo=f"Triagem Dor - {payload.caracteristica_dor.capitalize()} ({payload.intensidade_dor}/10)",
        descricao=desc_alerta,
        severidade='grave',
        estado='Novo',
    )
    db.add(alerta)

    db.commit()
    db.refresh(sessao)
    return sessao


@router.get('/api/users/{user_id}/triagem-dor', response_model=list[PainTriageResponse])
def get_user_pain_triages(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[PainTriageSession]:
    return db.scalars(
        select(PainTriageSession).where(PainTriageSession.user_id == user_id).order_by(desc(PainTriageSession.data_triagem))
    ).all()


@router.get('/api/alertas', response_model=list[ClinicalAlertResponse])
def list_clinical_alerts(
    estado: str | None = Query(default=None, description="Novo, Em revisao ou Tratado"),
    db: Annotated[Session, Depends(get_db)] = None,
) -> list[ClinicalAlert]:
    stmt = select(ClinicalAlert).order_by(desc(ClinicalAlert.criado_em))
    if estado and estado.lower() != 'todos':
        stmt = stmt.where(ClinicalAlert.estado == estado)
    return db.scalars(stmt).all()


@router.patch('/api/alertas/{alerta_id}', response_model=ClinicalAlertResponse)
def update_alert_status(
    alerta_id: int,
    payload: ClinicalAlertUpdate,
    db: Annotated[Session, Depends(get_db)],
) -> ClinicalAlert:
    alerta = db.get(ClinicalAlert, alerta_id)
    if not alerta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Alerta nao encontrado.')

    alerta.estado = payload.estado
    if payload.revisado_por:
        alerta.revisado_por = payload.revisado_por
    if payload.observacao_conduta:
        alerta.observacao_conduta = payload.observacao_conduta
    alerta.atualizado_em = utc_now()

    db.commit()
    db.refresh(alerta)
    return alerta


@router.post('/api/users/{user_id}/evolucoes', response_model=ClinicalNoteResponse, status_code=status.HTTP_201_CREATED)
def create_clinical_note(
    user_id: int,
    payload: ClinicalNoteCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ClinicalNote:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    note = ClinicalNote(
        user_id=user_id,
        profissional_nome=payload.profissional_nome,
        cargo=payload.cargo,
        conselho_classe=payload.conselho_classe,
        tipo_evolucao=payload.tipo_evolucao,
        conteudo=payload.conteudo,
        conduta_plano=payload.conduta_plano,
        criado_em=utc_now(),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get('/api/users/{user_id}/evolucoes', response_model=list[ClinicalNoteResponse])
def list_clinical_notes(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ClinicalNote]:
    return db.scalars(
        select(ClinicalNote).where(ClinicalNote.user_id == user_id).order_by(desc(ClinicalNote.criado_em))
    ).all()


@router.post('/api/users/{user_id}/locais-dor', response_model=PainMapResponse, status_code=status.HTTP_201_CREATED)
def record_pain_map_entry(
    user_id: int,
    payload: PainMapCreate,
    db: Annotated[Session, Depends(get_db)],
) -> PainMapEntry:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    entry = PainMapEntry(
        user_id=user_id,
        regiao_anatomica=payload.regiao_anatomica,
        tipo_ocorrencia=payload.tipo_ocorrencia,
        intensidade=payload.intensidade,
        foto_anexada_url=payload.foto_anexada_url,
        observacao=payload.observacao,
        medicamento_associado=payload.medicamento_associado,
        criado_em=utc_now(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.get('/api/users/{user_id}/locais-dor', response_model=list[PainMapResponse])
def list_pain_map_entries(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[PainMapEntry]:
    return db.scalars(
        select(PainMapEntry).where(PainMapEntry.user_id == user_id).order_by(desc(PainMapEntry.criado_em))
    ).all()


@router.post('/api/users/{user_id}/symptoms', response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
def create_symptom(
    user_id: int,
    payload: SymptomCreate,
    db: Annotated[Session, Depends(get_db)],
) -> Symptom:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuario nao encontrado.')

    symptom = Symptom(
        user_id=user_id,
        nome=payload.nome,
        gravidade=payload.gravidade,
        momento=payload.momento,
        observacao=payload.observacao,
    )
    db.add(symptom)
    db.commit()
    db.refresh(symptom)
    return symptom


@router.get('/api/users/{user_id}/symptoms', response_model=list[SymptomResponse])
def list_symptoms(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Symptom]:
    return db.scalars(select(Symptom).where(Symptom.user_id == user_id)).all()
