"""Dados demonstrativos usados na inicialização local do Zelo."""

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import (
    ClinicalAlert,
    ClinicalNote,
    ESASAssessment,
    Medication,
    Orientation,
    PainMapEntry,
    PainTriageSession,
    User,
)
from app.security import _hash_password


def seed_initial_data(db: Session) -> None:
    """Popula dados demonstrativos consistentes com a pesquisa de base se o banco estiver vazio."""
    if db.scalar(select(User).limit(1)):
        return

    # 1. Administrador Geral do Sistema
    admin_user = User(
        nome="Administrador do Sistema Zelo",
        email="admin@zelo.saude.gov.br",
        senha_hash=_hash_password("admin123"),
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
        senha_hash=_hash_password("medico123"),
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
        senha_hash=_hash_password("enf123"),
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
        senha_hash=_hash_password("paciente123"),
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
        senha_hash=_hash_password("paciente123"),
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
        senha_hash=_hash_password("zelo123"),
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
        senha_hash=_hash_password("zelo123"),
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
        senha_hash=_hash_password("zelo123"),
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
