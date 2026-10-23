"""API principal do projeto Zelo.

Modulo FastAPI com endpoints para:
- Autenticacao e gestao de usuarios (Equipe Assistencial, Pacientes e Cuidadores)
- Registro e consulta da Escala ESAS (9 sintomas multidimensionais)
- Fluxo conversacional da Triagem da Dor validado por juizes especialistas (IVC = 0,95)
- Central de Alertas e Triagem de Risco da Equipe de Saude (Novo -> Em revisao -> Tratado)
- Prontuario integrado, Medicamentos (RENAME), Mapa de Dor e Evolucoes Clinicas
"""

import hashlib
import hmac
from datetime import datetime
from pathlib import Path
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy import desc, select, text
from sqlalchemy.orm import Session

from app.config import settings
from app.database import Base, engine, get_db, SessionLocal
from app.models import (
    ClinicalAlert,
    ClinicalNote,
    ESASAssessment,
    Medication,
    Orientation,
    PainMapEntry,
    PainTriageSession,
    Symptom,
    User,
)
from app.schemas import (
    ClinicalAlertCreate,
    ClinicalAlertResponse,
    ClinicalAlertUpdate,
    ClinicalNoteCreate,
    ClinicalNoteResponse,
    ESASCreate,
    ESASResponse,
    HealthResponse,
    MedicationCreate,
    MedicationResponse,
    OrientationCreate,
    OrientationResponse,
    PainMapCreate,
    PainMapResponse,
    PainTriageCreate,
    PainTriageResponse,
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

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

frontend_dir = Path(__file__).resolve().parent.parent.parent / "frontend"
if frontend_dir.exists():
    app.mount("/frontend", StaticFiles(directory=str(frontend_dir), html=True), name="frontend")



def seed_initial_data(db: Session) -> None:
    """Popula dados demonstrativos consistentes com a pesquisa de base se o banco estiver vazio."""
    if db.scalar(select(User).limit(1)):
        return

    # 1. Administrador Geral do Sistema
    admin_user = User(
        nome="Administrador do Sistema Zelo",
        email="admin@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("admin123".encode()).hexdigest(),
        perfil="admin",
        prontuario="ADM-001",
        telefone="(41) 3000-0001",
        ativo=True,
    )
    db.add(admin_user)

    # 2. Médico Assistencial Paliativista
    medico_user = User(
        nome="Dr. Alexandre Prado",
        email="medico@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("medico123".encode()).hexdigest(),
        perfil="assistencial",
        prontuario="CRM-PR 24890",
        telefone="(41) 3000-0002",
        ativo=True,
    )
    db.add(medico_user)

    # 3. Enfermeira Especialista
    enfermeira_user = User(
        nome="Enf. Mariana Santos",
        email="enfermeira@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("enf123".encode()).hexdigest(),
        perfil="assistencial",
        prontuario="COREN-PR 330719",
        telefone="(41) 3000-0003",
        ativo=True,
    )
    db.add(enfermeira_user)
    db.flush()

    # 4. Paciente 01: Leovegildo Coimbra Nunes (Cuidador: Carlos Nunes)
    p1 = User(
        nome="Leovegildo Coimbra Nunes",
        email="leovegildo.paciente@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("paciente123".encode()).hexdigest(),
        perfil="paciente",
        prontuario="001",
        idade=74,
        sexo="Masculino",
        cpf="123.456.789-00",
        telefone="(41) 98713-2808",
        cuidador_principal="Carlos Nunes",
        parentesco_cuidador="Filho(a)",
        diagnostico_oncologico="Neoplasia Maligna de Prostata (CID-10 C61)",
        pps_score=70,
        comorbidades="Hipertensao Arterial Sistemica (HAS), Diabetes Mellitus tipo 2",
        alergias="Dipirona sodica",
        tratamento_modificador="Cuidados Paliativos Exclusivos",
        proxima_consulta="18/10/2026 as 10:00 (Dra. Ana)",
        ativo=True,
    )
    db.add(p1)
    db.flush()

    # 5. Usuário de Login Direto para o Cuidador Familiar Carlos
    c1 = User(
        nome="Carlos Nunes (Cuidador)",
        email="cuidador@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("paciente123".encode()).hexdigest(),
        perfil="paciente",
        prontuario="CUID-001",
        telefone="(41) 98713-2808",
        cpf="987.654.321-00",
        ativo=True,
    )
    db.add(c1)
    db.flush()

    # 3. Paciente 02: Maria Helena Fagundes
    p2 = User(
        nome="Maria Helena Fagundes",
        email="maria.helena@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("zelo123".encode()).hexdigest(),
        perfil="paciente",
        prontuario="002",
        idade=68,
        sexo="Feminino",
        cpf="234.567.890-11",
        telefone="(41) 99123-4567",
        cuidador_principal="Roberto Fagundes",
        parentesco_cuidador="Conjuge",
        diagnostico_oncologico="Neoplasia de Colon e Reto (CID-10 C18)",
        pps_score=60,
        comorbidades="HAS, Cardiopatia Isquemica",
        alergias="Sem alergias relatadas",
        tratamento_modificador="Cuidados Paliativos Exclusivos",
        proxima_consulta="22/10/2026 as 14:00 (Dr. Sergio)",
        ativo=True,
    )
    db.add(p2)
    db.flush()

    # 4. Paciente 03: Joao Batista da Silva
    p3 = User(
        nome="Joao Batista da Silva",
        email="joao.batista@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("zelo123".encode()).hexdigest(),
        perfil="paciente",
        prontuario="003",
        idade=81,
        sexo="Masculino",
        cpf="345.678.901-22",
        telefone="(41) 98845-6789",
        cuidador_principal="Ana Paula da Silva",
        parentesco_cuidador="Filho(a)",
        diagnostico_oncologico="Neoplasia Pulmonar / Bronquica (CID-10 C34)",
        pps_score=40,
        comorbidades="DPOC, HAS",
        alergias="Sem relatos",
        tratamento_modificador="Cuidados Paliativos Exclusivos",
        proxima_consulta="25/10/2026 as 09:30",
        ativo=True,
    )
    db.add(p3)
    db.flush()

    # 5. Paciente 04: Alzira Pereira dos Santos
    p4 = User(
        nome="Alzira Pereira dos Santos",
        email="alzira.santos@zelo.saude.gov.br",
        senha_hash=hashlib.sha256("zelo123".encode()).hexdigest(),
        perfil="paciente",
        prontuario="004",
        idade=79,
        sexo="Feminino",
        cpf="456.789.012-33",
        telefone="(41) 99678-1234",
        cuidador_principal="Sem acompanhante fixo",
        parentesco_cuidador="Proprio paciente",
        diagnostico_oncologico="Neoplasia de Mama (CID-10 C50)",
        pps_score=80,
        comorbidades="HAS, Osteoporose",
        alergias="Iodo",
        tratamento_modificador="Cuidados Paliativos Exclusivos",
        proxima_consulta="29/10/2026 as 11:00",
        ativo=True,
    )
    db.add(p4)
    db.flush()

    # Avaliacoes ESAS para Paciente 01
    esas_p1_1 = ESASAssessment(
        user_id=p1.id,
        dor=3, cansaco=5, nausea=1, depressao=2, ansiedade=3, sonolencia=3, apetite=3, mal_estar=3, falta_de_ar=1,
        gravidade_maxima="leve", acionou_triagem_dor=False,
        data_registro=datetime(2026, 10, 7, 9, 0),
    )
    esas_p1_2 = ESASAssessment(
        user_id=p1.id,
        dor=5, cansaco=6, nausea=2, depressao=3, ansiedade=5, sonolencia=4, apetite=4, mal_estar=5, falta_de_ar=2,
        gravidade_maxima="moderada", acionou_triagem_dor=False,
        data_registro=datetime(2026, 10, 8, 9, 0),
    )
    esas_p1_3 = ESASAssessment(
        user_id=p1.id,
        dor=8, cansaco=5, nausea=2, depressao=3, ansiedade=4, sonolencia=3, apetite=4, mal_estar=4, falta_de_ar=1,
        gravidade_maxima="grave", acionou_triagem_dor=True,
        observacao="Paciente relata piora da dor lombar apos esforco ao levantar.",
        data_registro=datetime(2026, 10, 9, 9, 0),
    )
    db.add_all([esas_p1_1, esas_p1_2, esas_p1_3])

    # Sessao de triagem
    triagem_p1 = PainTriageSession(
        user_id=p1.id,
        intensidade_dor=8,
        caracteristica_dor="somatica",
        mais_de_duas_semanas=False,
        tipo_dor="aguda",
        fez_dose_resgate=True,
        medicamentos_efetivos=False,
        em_acompanhamento=True,
        tem_sintoma_acompanhante=False,
        tem_fator_piora=True,
        fator_piora_desc="Movimentacao brusca no leito",
        alerta_sinais_alarme_exibido=True,
        medidas_nao_farmacologicas_exibidas=True,
        solicitou_agendamento=True,
        status_atendimento="alerta_gerado",
        data_triagem=datetime(2026, 10, 9, 9, 10),
    )
    db.add(triagem_p1)

    # Alertas clinicos
    alerta_p1 = ClinicalAlert(
        user_id=p1.id,
        tipo_alerta="dor_grave",
        titulo="Registro ESAS disponivel - Dor 8/10",
        descricao="Paciente informou Dor em intensidade 8 (Dor Somatica - pontada/aperto). Fez uso de dose de resgate sem alivio satisfatorio. Solicitou contato para agendamento de consulta.",
        severidade="grave",
        estado="Novo",
        criado_em=datetime(2026, 10, 9, 9, 12),
    )
    alerta_p2 = ClinicalAlert(
        user_id=p2.id,
        tipo_alerta="dor_moderada",
        titulo="Resposta de dor disponivel - Colica difusa",
        descricao="Paciente informou dor visceral moderada (5/10) e constipacao intestinal persistente ha 3 dias. Em acompanhamento.",
        severidade="moderada",
        estado="Em revisao",
        revisado_por="Enf. Bruna Tres",
        observacao_conduta="Entrado em contato com o conjuge Roberto; orientado aumento de ingesta hidrica e uso de laxativo prescrito.",
        criado_em=datetime(2026, 10, 8, 14, 0),
        atualizado_em=datetime(2026, 10, 8, 15, 30),
    )
    alerta_p3 = ClinicalAlert(
        user_id=p3.id,
        tipo_alerta="sintoma_grave",
        titulo="Exemplo de revisao concluida - Dispneia",
        descricao="Paciente apresentou pico de dispneia (6/10). Realizado ajuste na oxigenoterapia domiciliar e tecnicas de respiracao.",
        severidade="moderada",
        estado="Tratado",
        revisado_por="Dr. Luiz Sergio Batista",
        observacao_conduta="Sintoma estabilizado em domicilio. Paciente confortavel em posicao de Fowler.",
        criado_em=datetime(2026, 10, 7, 10, 0),
        atualizado_em=datetime(2026, 10, 7, 11, 45),
    )
    db.add_all([alerta_p1, alerta_p2, alerta_p3])

    # Medicamentos (RENAME)
    med1 = Medication(
        user_id=p1.id,
        nome="Codeina 30mg",
        dose="1 Comprimido",
        horario="08:00, 14:00, 20:00, 02:00",
        frequencia="A cada 6 horas",
        observacao="Tomar com agua apos as refeicoes. Nao suspender sem orientacao.",
        status="ativo",
        eh_dose_resgate=False,
        medico_prescritor="Dr. Luiz Sergio Batista",
        vigencia="14/11/2026",
    )
    med2 = Medication(
        user_id=p1.id,
        nome="Gabapentina 300mg",
        dose="1 Capsula",
        horario="08:00, 20:00",
        frequencia="A cada 12 horas",
        observacao="Controle adjuvante da dor neuropatica e somatica.",
        status="ativo",
        eh_dose_resgate=False,
        medico_prescritor="Dr. Luiz Sergio Batista",
        vigencia="14/11/2026",
    )
    med3 = Medication(
        user_id=p1.id,
        nome="Morfina 10mg (Dose de Resgate)",
        dose="1 Comprimido se dor intensa",
        horario="Se necessario",
        frequencia="Intervalo minimo de 4 horas",
        observacao="Uso estrito em exacerbações agudas de dor.",
        status="ativo",
        eh_dose_resgate=True,
        medico_prescritor="Dr. Luiz Sergio Batista",
        vigencia="14/11/2026",
    )
    med4 = Medication(
        user_id=p1.id,
        nome="Paracetamol 500mg",
        dose="1 Comprimido",
        horario="Conforme prescricao",
        frequencia="A cada 6 horas se dor leve/moderada",
        observacao="Analgesia complementar.",
        status="ativo",
        eh_dose_resgate=False,
        medico_prescritor="Dr. Luiz Sergio Batista",
        vigencia="14/11/2026",
    )
    db.add_all([med1, med2, med3, med4])

    # Mapa de dor
    dor_mapa = PainMapEntry(
        user_id=p1.id,
        regiao_anatomica="Regiao escapular bilateral e coluna lombar",
        tipo_ocorrencia="dor",
        intensidade=8,
        medicamento_associado="Codeina 30mg + Morfina de resgate",
        observacao="Dor somatica profunda com irradiacao para regiao dorsal.",
        criado_em=datetime(2026, 10, 9, 9, 5),
    )
    db.add(dor_mapa)

    # Evolucao clinica
    ev1 = ClinicalNote(
        user_id=p1.id,
        profissional_nome="Enf. Bruna Tres",
        cargo="Enfermeira Especialista em Cuidados Paliativos",
        conselho_classe="COREN-PR 330719",
        tipo_evolucao="Telemonitoramento de Enfermagem (Resolucao Cofen 634/2020)",
        conteudo="Realizado contato telefonico com o cuidador familiar (filho Carlos). Paciente em repouso no leito, lucido e orientado no tempo e espaco. Queixa de dor intensa em regiao dorsal/lombar (escore ESAS 8). Orientado posicionamento em decubito lateral com travesseiros de apoio e compressa morna. Reforcada dose de resgate prescrita pela equipe medica.",
        conduta_plano="Agendada reavaliacao dos sintomas em 2 horas. Caso nao ocorra alivio em 4 horas ou surjam sinais de alarme neurologico/sonolencia excessiva, orientada procura imediata ao Pronto Atendimento.",
        criado_em=datetime(2026, 10, 9, 9, 30),
    )
    db.add(ev1)

    # Orientacoes
    ori1 = Orientation(
        user_id=p1.id,
        titulo="Medidas nao farmacologicas para controle da dor aguda",
        descricao="Procure manter o ambiente calmo e bem ventilado. Posicione travesseiros sob as pernas para alivio lombar. Pratique respiracao lenta e tecnicas de distracao como musica ambiente suave.",
        categoria="dor",
        prioridade="alta",
        atualizada_em=datetime(2026, 10, 9, 9, 15),
    )
    ori2 = Orientation(
        user_id=p1.id,
        titulo="Sinais de Alerta no Uso de Opioides",
        descricao="Caso apresente sonolencia excessiva de dificil despertar, confusao mental repentina, perda de forca nas pernas ou lesoes bolhosas, procure imediatamente o atendimento de urgencia.",
        categoria="seguranca",
        prioridade="alta",
        atualizada_em=datetime(2026, 10, 9, 9, 15),
    )
    db.add_all([ori1, ori2])

    db.commit()


@app.on_event('startup')
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_initial_data(db)


@app.get('/health', response_model=HealthResponse)
def health_check(db: Annotated[Session, Depends(get_db)]) -> dict:
    try:
        db.execute(text('SELECT 1'))
        db_type = 'sqlite' if settings.DATABASE_URL.startswith('sqlite') else 'mysql'
        return {'status': 'ok', 'database': db_type}
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f'Database indisponivel: {exc}',
        ) from exc


@app.post('/api/seed', status_code=status.HTTP_200_OK)
def trigger_seed(db: Annotated[Session, Depends(get_db)]) -> dict:
    seed_initial_data(db)
    return {"message": "Base de dados verificada e populada com sucesso."}


@app.post('/api/users', response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Annotated[Session, Depends(get_db)]) -> User:
    existing = db.scalar(select(User).where(User.email == payload.email))
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Ja existe um usuario com este e-mail.',
        )

    user = User(
        nome=payload.nome,
        email=str(payload.email),
        senha_hash=hashlib.sha256(payload.senha.encode('utf-8')).hexdigest(),
        perfil=payload.perfil,
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
        ativo=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post('/api/auth/login', response_model=UserResponse)
@app.post('/api/login', response_model=UserResponse)
def login(payload: UserLogin, db: Annotated[Session, Depends(get_db)]) -> User:
    identificador = payload.email.strip()
    cpf_digits = ''.join(c for c in identificador if c.isdigit())
    cpf_formatado = f"{cpf_digits[:3]}.{cpf_digits[3:6]}.{cpf_digits[6:9]}-{cpf_digits[9:]}" if len(cpf_digits) == 11 else None

    user = db.scalar(
        select(User).where(
            (User.email.ilike(identificador)) | 
            (User.cpf == identificador) | 
            (User.cpf == cpf_formatado) |
            (User.prontuario.ilike(identificador)) |
            ((identificador == "cuidador@zelo.saude.gov.br") & (User.id == 1))
        )
    )
    senha_hash = hashlib.sha256(payload.senha.encode('utf-8')).hexdigest()
    if not user or not user.ativo or not hmac.compare_digest(user.senha_hash, senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Credenciais invalidas. Verifique o identificador e a senha.',
        )
    return user


@app.get('/api/users', response_model=list[UserResponse])
def list_users(
    perfil: str | None = None,
    db: Annotated[Session, Depends(get_db)] = None,
) -> list[User]:
    stmt = select(User)
    if perfil:
        stmt = stmt.where(User.perfil == perfil)
    return db.scalars(stmt).all()


@app.get('/api/users/{user_id}', response_model=UserResponse)
def get_user(user_id: int, db: Annotated[Session, Depends(get_db)]) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Usuario nao encontrado.')
    return user


@app.post('/api/users/{user_id}/esas', response_model=ESASResponse, status_code=status.HTTP_201_CREATED)
def record_esas_assessment(
    user_id: int,
    payload: ESASCreate,
    db: Annotated[Session, Depends(get_db)],
) -> ESASAssessment:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Paciente nao encontrado.')

    scores = [
        payload.dor, payload.cansaco, payload.nausea, payload.depressao,
        payload.ansiedade, payload.sonolencia, payload.apetite,
        payload.mal_estar, payload.falta_de_ar,
    ]
    max_score = max(scores)
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
        data_registro=datetime.utcnow(),
    )
    db.add(esas)

    if acionou_triagem:
        alerta = ClinicalAlert(
            user_id=user_id,
            tipo_alerta='dor_grave',
            titulo=f'Registro ESAS - Dor intensa ({payload.dor}/10)',
            descricao=f'{user.nome} informou nivel de dor {payload.dor}/10 na regua ESAS. Fluxo conversacional de triagem Zelo ativado no domicilio.',
            severidade='grave',
            estado='Novo',
        )
        db.add(alerta)

    db.commit()
    db.refresh(esas)
    return esas


@app.get('/api/users/{user_id}/esas', response_model=list[ESASResponse])
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


@app.post('/api/users/{user_id}/triagem-dor', response_model=PainTriageResponse, status_code=status.HTTP_201_CREATED)
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
        data_triagem=datetime.utcnow(),
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


@app.get('/api/users/{user_id}/triagem-dor', response_model=list[PainTriageResponse])
def get_user_pain_triages(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[PainTriageSession]:
    return db.scalars(
        select(PainTriageSession).where(PainTriageSession.user_id == user_id).order_by(desc(PainTriageSession.data_triagem))
    ).all()


@app.get('/api/alertas', response_model=list[ClinicalAlertResponse])
def list_clinical_alerts(
    estado: str | None = Query(default=None, description="Novo, Em revisao ou Tratado"),
    db: Annotated[Session, Depends(get_db)] = None,
) -> list[ClinicalAlert]:
    stmt = select(ClinicalAlert).order_by(desc(ClinicalAlert.criado_em))
    if estado and estado.lower() != 'todos':
        stmt = stmt.where(ClinicalAlert.estado == estado)
    return db.scalars(stmt).all()


@app.patch('/api/alertas/{alerta_id}', response_model=ClinicalAlertResponse)
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
    alerta.atualizado_em = datetime.utcnow()

    db.commit()
    db.refresh(alerta)
    return alerta


@app.post('/api/users/{user_id}/evolucoes', response_model=ClinicalNoteResponse, status_code=status.HTTP_201_CREATED)
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
        criado_em=datetime.utcnow(),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@app.get('/api/users/{user_id}/evolucoes', response_model=list[ClinicalNoteResponse])
def list_clinical_notes(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[ClinicalNote]:
    return db.scalars(
        select(ClinicalNote).where(ClinicalNote.user_id == user_id).order_by(desc(ClinicalNote.criado_em))
    ).all()


@app.post('/api/users/{user_id}/locais-dor', response_model=PainMapResponse, status_code=status.HTTP_201_CREATED)
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
        criado_em=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@app.get('/api/users/{user_id}/locais-dor', response_model=list[PainMapResponse])
def list_pain_map_entries(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[PainMapEntry]:
    return db.scalars(
        select(PainMapEntry).where(PainMapEntry.user_id == user_id).order_by(desc(PainMapEntry.criado_em))
    ).all()


@app.post('/api/users/{user_id}/medications', response_model=MedicationResponse, status_code=status.HTTP_201_CREATED)
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


@app.get('/api/users/{user_id}/medications', response_model=list[MedicationResponse])
def list_medications(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Medication]:
    return db.scalars(select(Medication).where(Medication.user_id == user_id)).all()


@app.post('/api/users/{user_id}/orientations', response_model=OrientationResponse, status_code=status.HTTP_201_CREATED)
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


@app.get('/api/users/{user_id}/orientations', response_model=list[OrientationResponse])
def list_orientations(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Orientation]:
    return db.scalars(select(Orientation).where(Orientation.user_id == user_id)).all()


@app.post('/api/users/{user_id}/symptoms', response_model=SymptomResponse, status_code=status.HTTP_201_CREATED)
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


@app.get('/api/users/{user_id}/symptoms', response_model=list[SymptomResponse])
def list_symptoms(
    user_id: int,
    db: Annotated[Session, Depends(get_db)],
) -> list[Symptom]:
    return db.scalars(select(Symptom).where(Symptom.user_id == user_id)).all()


@app.get('/')
def root():
    return RedirectResponse(url="/frontend/index.html")


@app.get('/api')
def api_info() -> dict:
    return {
        'message': 'Zelo API ativa',
        'version': settings.APP_VERSION,
        'docs': '/docs',
        'swagger': '/openapi.json',
        'modulos': ['ESAS Multidimensional', 'Triagem Chatbot Zelo (Script Validado)', 'Central de Alertas', 'Prontuario Multiprofissional'],
    }
