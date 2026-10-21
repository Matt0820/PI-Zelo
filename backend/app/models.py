"""Modelos ORM do ecossistema Zelo.

Representa a estrutura de dados baseada na pesquisa de mestrado
(Bruna Tres Grzybowski, 2023) e no desenvolvimento do sistema web Zelo
para cuidados paliativos.

Engloba pacientes, cuidadores, equipe multiprofissional, escala ESAS (9 sintomas),
fluxo conversacional validado por juízes (triagem da dor), central de alertas
assistenciais, medicamentos (RENAME) e evoluções de enfermagem/medicina.
"""

from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    """Entidade de usuário: pacientes, cuidadores familiares ou profissionais de saúde."""

    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    senha_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    perfil: Mapped[str] = mapped_column(String(30), default='paciente', nullable=False)  # paciente, cuidador, assistencial
    ativo: Mapped[bool] = mapped_column(Boolean, default=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Dados clínicos e sociodemográficos (baseados na pesquisa com 128 prontuários no HEG)
    prontuario: Mapped[str | None] = mapped_column(String(50), nullable=True)
    idade: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sexo: Mapped[str | None] = mapped_column(String(10), nullable=True)
    cpf: Mapped[str | None] = mapped_column(String(20), nullable=True)
    telefone: Mapped[str | None] = mapped_column(String(30), nullable=True)
    cuidador_principal: Mapped[str | None] = mapped_column(String(150), nullable=True)  # ex: Filho(a) ou Cônjuge
    parentesco_cuidador: Mapped[str | None] = mapped_column(String(50), nullable=True)
    diagnostico_oncologico: Mapped[str | None] = mapped_column(String(200), nullable=True)  # ex: Próstata (C61), Mama, Cólon/Reto
    pps_score: Mapped[int | None] = mapped_column(Integer, nullable=True)  # Escala de Performance Paliativa (0 a 100)
    comorbidades: Mapped[str | None] = mapped_column(Text, nullable=True)  # ex: HAS, DM, Cardiopatias
    alergias: Mapped[str | None] = mapped_column(String(255), nullable=True)
    tratamento_modificador: Mapped[str | None] = mapped_column(String(100), default='Cuidados Paliativos Exclusivos')
    proxima_consulta: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # Relações
    sintomas: Mapped[list['Symptom']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    avaliacoes_esas: Mapped[list['ESASAssessment']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    triagens_dor: Mapped[list['PainTriageSession']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    alertas: Mapped[list['ClinicalAlert']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    medicacoes: Mapped[list['Medication']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    evolucoes: Mapped[list['ClinicalNote']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    locais_dor: Mapped[list['PainMapEntry']] = relationship(back_populates='usuario', cascade='all, delete-orphan')
    orientacoes: Mapped[list['Orientation']] = relationship(back_populates='usuario', cascade='all, delete-orphan')


class Symptom(Base):
    """Registro genérico de sintoma (mantido para compatibilidade)."""

    __tablename__ = 'symptoms'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    gravidade: Mapped[str] = mapped_column(String(20), nullable=False)
    momento: Mapped[str] = mapped_column(String(100), nullable=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='sintomas')


class ESASAssessment(Base):
    """Avaliação completa pela Escala de ESAS (Edmonton Symptom Assessment System).
    
    Mensura quantitativamente em régua de 0 a 10 os 9 sintomas validados
    (Monteiro, Almeida, Kruse, 2013) e sintomas adicionais como constipação.
    """

    __tablename__ = 'esas_assessments'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    data_registro: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # 9 sintomas oficiais da ESAS (0 = Ausência do sintoma; 10 = Pior intensidade possível)
    dor: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    cansaco: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    nausea: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    depressao: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    ansiedade: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sonolencia: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    apetite: Mapped[int] = mapped_column(Integer, default=0, nullable=False)      # 0 com apetite, 10 pior falta de apetite
    mal_estar: Mapped[int] = mapped_column(Integer, default=0, nullable=False)    # sensação global de bem-estar / mal-estar
    falta_de_ar: Mapped[int] = mapped_column(Integer, default=0, nullable=False)  # dispneia

    # Sintoma adicional prevalente na pesquisa
    constipacao: Mapped[int | None] = mapped_column(Integer, default=0, nullable=True)

    # Classificação agregada e gatilho de triagem
    gravidade_maxima: Mapped[str] = mapped_column(String(20), default='leve')  # leve (0-3), moderada (4-6), grave (7-10)
    acionou_triagem_dor: Mapped[bool] = mapped_column(Boolean, default=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)

    usuario: Mapped['User'] = relationship(back_populates='avaliacoes_esas')


class PainTriageSession(Base):
    """Sessão de triagem de dor conduzida pelo Chatbot Zelo.
    
    Implementa com rigor e fidelidade o SCRIPT CLÍNICO VALIDADO POR JUÍZES
    especialistas em cuidados paliativos e gerontologia (IVC médio = 0,95)
    da dissertação de mestrado de referência (Bruna Grzybowski, 2023).
    Acionado quando Dor na ESAS >= 7.
    """

    __tablename__ = 'pain_triage_sessions'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    data_triagem: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    # Intensidade inicial (Gatilho)
    intensidade_dor: Mapped[int] = mapped_column(Integer, nullable=False)

    # 1. Características da Dor (IVC Visceral: 0.91; Neuropática: 0.95; Somática: 1.00)
    caracteristica_dor: Mapped[str] = mapped_column(String(50), nullable=False)
    # Valores: 'visceral' (difusa, cólica), 'neuropatica' (choque/queimação), 'somatica' (pontada/aperto), 'nenhuma'

    # 2. Tipo / Duração (IVC: 0.91)
    mais_de_duas_semanas: Mapped[bool] = mapped_column(Boolean, nullable=False)
    tipo_dor: Mapped[str] = mapped_column(String(20), nullable=False)  # 'aguda' ou 'cronica'

    # 3. Anamnese de Acompanhamento e Medicamentos
    fez_dose_resgate: Mapped[bool] = mapped_column(Boolean, default=False)     # IVC: 0.90
    medicamentos_efetivos: Mapped[bool] = mapped_column(Boolean, default=True) # IVC: 0.95
    em_acompanhamento: Mapped[bool] = mapped_column(Boolean, default=True)     # IVC: 0.95
    tem_sintoma_acompanhante: Mapped[bool] = mapped_column(Boolean, default=False) # IVC: 1.00
    sintoma_acompanhante_desc: Mapped[str | None] = mapped_column(String(200), nullable=True)
    tem_fator_piora: Mapped[bool] = mapped_column(Boolean, default=False)      # IVC: 0.90
    fator_piora_desc: Mapped[str | None] = mapped_column(String(200), nullable=True)

    # 4. Condutas e Desfechos Assistenciais
    alerta_sinais_alarme_exibido: Mapped[bool] = mapped_column(Boolean, default=True)
    medidas_nao_farmacologicas_exibidas: Mapped[bool] = mapped_column(Boolean, default=True)
    solicitou_agendamento: Mapped[bool] = mapped_column(Boolean, default=False)
    status_atendimento: Mapped[str] = mapped_column(String(30), default='alerta_gerado') # alerta_gerado, revisado, agendado

    usuario: Mapped['User'] = relationship(back_populates='triagens_dor')


class ClinicalAlert(Base):
    """Central de Alertas e Triagem de Risco para a Equipe de Saúde.
    
    Reflete os estados de rastreabilidade definidos na arquitetura:
    'Novo' -> 'Em revisão' -> 'Tratado', com trilha de auditoria e parecer.
    """

    __tablename__ = 'clinical_alerts'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    tipo_alerta: Mapped[str] = mapped_column(String(50), nullable=False) # dor_grave, dose_resgate, agendamento_urgente
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    severidade: Mapped[str] = mapped_column(String(20), default='grave') # grave, moderada, informativa
    estado: Mapped[str] = mapped_column(String(30), default='Novo')     # Novo, Em revisão, Tratado
    revisado_por: Mapped[str | None] = mapped_column(String(150), nullable=True)
    observacao_conduta: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    atualizado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='alertas')


class Medication(Base):
    """Medicamento prescrito conforme RENAME / rotina de Cuidados Paliativos."""

    __tablename__ = 'medications'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    nome: Mapped[str] = mapped_column(String(150), nullable=False)
    dose: Mapped[str] = mapped_column(String(100), nullable=False)
    horario: Mapped[str] = mapped_column(String(50), nullable=False)
    frequencia: Mapped[str] = mapped_column(String(80), nullable=False)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default='ativo')
    eh_dose_resgate: Mapped[bool] = mapped_column(Boolean, default=False)
    medico_prescritor: Mapped[str | None] = mapped_column(String(150), nullable=True)
    vigencia: Mapped[str | None] = mapped_column(String(50), nullable=True)

    usuario: Mapped['User'] = relationship(back_populates='medicacoes')


class ClinicalNote(Base):
    """Evolução clínica multiprofissional (Enfermagem e Medicina)."""

    __tablename__ = 'clinical_notes'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    profissional_nome: Mapped[str] = mapped_column(String(150), nullable=False)
    cargo: Mapped[str] = mapped_column(String(80), nullable=False) # Enfermeiro(a), Médico(a) Paliativista
    conselho_classe: Mapped[str | None] = mapped_column(String(50), nullable=True) # COREN, CRM
    tipo_evolucao: Mapped[str] = mapped_column(String(50), default='Acompanhamento Domiciliar')
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    conduta_plano: Mapped[str | None] = mapped_column(Text, nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='evolucoes')


class PainMapEntry(Base):
    """Mapeamento anatômico de local de dor, edema ou lesão tumoral/por pressão."""

    __tablename__ = 'pain_map_entries'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    regiao_anatomica: Mapped[str] = mapped_column(String(100), nullable=False) # ex: Lombar, Escápula D, Abdômen
    tipo_ocorrencia: Mapped[str] = mapped_column(String(30), default='dor')     # dor, edema, lesao
    intensidade: Mapped[int] = mapped_column(Integer, default=5)
    foto_anexada_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    observacao: Mapped[str | None] = mapped_column(Text, nullable=True)
    medicamento_associado: Mapped[str | None] = mapped_column(String(100), nullable=True)
    criado_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='locais_dor')


class Orientation(Base):
    """Orientação educativa ou assistencial enviada ao paciente ou cuidador."""

    __tablename__ = 'orientations'

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey('users.id'), nullable=False)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    categoria: Mapped[str] = mapped_column(String(30), nullable=False)
    prioridade: Mapped[str] = mapped_column(String(20), nullable=False)
    atualizada_em: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    usuario: Mapped['User'] = relationship(back_populates='orientacoes')
