"""Schemas de entrada e saída da API Zelo.

Contratos Pydantic para validação e serialização de dados, abrangendo:
- Usuários e perfis (equipe assistencial, paciente, cuidador)
- Avaliação da Escala ESAS (9 sintomas)
- Triagem conversacional da dor (Script clínico validado por juízes)
- Central de Alertas Clínicos (Novo -> Em revisão -> Tratado)
- Medicamentos (RENAME) e Evoluções de Enfermagem/Medicina
"""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field


# ============================================================================
# USUÁRIOS E AUTENTICAÇÃO
# ============================================================================

class UserBase(BaseModel):
    """Campos compartilhados de usuário."""
    nome: str
    email: EmailStr
    perfil: str = 'paciente'  # assistencial, paciente, cuidador
    prontuario: str | None = None
    idade: int | None = None
    sexo: str | None = None
    cpf: str | None = None
    telefone: str | None = None
    cuidador_principal: str | None = None
    parentesco_cuidador: str | None = None
    diagnostico_oncologico: str | None = None
    pps_score: int | None = None
    comorbidades: str | None = None
    alergias: str | None = None
    proxima_consulta: str | None = None
    tratamento_modificador: str | None = None
    motivo_cuidados_paliativos: str | None = None


class UserCreate(UserBase):
    """Estrutura aceita no cadastro de um novo usuário."""
    senha: str


class UserUpdate(BaseModel):
    """Campos editáveis do prontuário; credenciais e perfil não podem ser alterados aqui."""
    nome: str | None = None
    prontuario: str | None = None
    idade: int | None = None
    sexo: str | None = None
    cpf: str | None = None
    telefone: str | None = None
    cuidador_principal: str | None = None
    parentesco_cuidador: str | None = None
    diagnostico_oncologico: str | None = None
    motivo_cuidados_paliativos: str | None = None
    pps_score: int | None = None
    comorbidades: str | None = None
    alergias: str | None = None
    proxima_consulta: str | None = None
    tratamento_modificador: str | None = None


class UserLogin(BaseModel):
    """Payload de autenticação (aceita email, CPF ou prontuário)."""
    email: str
    senha: str


class UserResponse(UserBase):
    """Resposta pública com dados do usuário/paciente."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    criado_em: datetime


# ============================================================================
# ESAS (EDMONTON SYMPTOM ASSESSMENT SYSTEM)
# ============================================================================

class ESASCreate(BaseModel):
    """Submissão da avaliação ESAS completa (9 sintomas de 0 a 10)."""
    dor: int = Field(ge=0, le=10, description="Intensidade da dor de 0 a 10")
    cansaco: int = Field(ge=0, le=10, description="Cansaço/Fadiga de 0 a 10")
    nausea: int = Field(ge=0, le=10, description="Náusea de 0 a 10")
    depressao: int = Field(ge=0, le=10, description="Depressão de 0 a 10")
    ansiedade: int = Field(ge=0, le=10, description="Ansiedade de 0 a 10")
    sonolencia: int = Field(ge=0, le=10, description="Sonolência de 0 a 10")
    apetite: int = Field(ge=0, le=10, description="Apetite (0 com apetite, 10 pior falta) de 0 a 10")
    mal_estar: int = Field(ge=0, le=10, description="Mal-estar global de 0 a 10")
    falta_de_ar: int = Field(ge=0, le=10, description="Falta de ar/Dispneia de 0 a 10")
    constipacao: int | None = Field(default=0, ge=0, le=10)
    observacao: str | None = None


class ESASResponse(ESASCreate):
    """Resposta com dados persistidos da avaliação ESAS."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    gravidade_maxima: str
    acionou_triagem_dor: bool
    data_registro: datetime


# ============================================================================
# TRIAGEM CONVERSACIONAL DA DOR (SCRIPT VALIDADO POR JUÍZES)
# ============================================================================

class PainTriageCreate(BaseModel):
    """Registro de sessão de triagem conduzida pelo Chatbot Zelo."""
    intensidade_dor: int = Field(default=8, ge=7, le=10, description="Gatilho de dor severa na ESAS")
    caracteristica_dor: str = Field(default="somatica", description="visceral, neuropatica, somatica ou nenhuma")
    mais_de_duas_semanas: bool = Field(default=False, description="True se dor dura mais de 2 semanas (cronica); False se aguda")
    tipo_dor: str = Field(default="aguda", description="aguda ou cronica")
    fez_dose_resgate: bool = Field(default=False, description="Se fez uso da dose extra/resgate")
    medicamentos_efetivos: bool = Field(default=True, description="Se medicamentos estão sendo efetivos")
    em_acompanhamento: bool = Field(default=True, description="Se já está em acompanhamento com a equipe")
    tem_sintoma_acompanhante: bool = Field(default=False)
    sintoma_acompanhante_desc: str | None = None
    tem_fator_piora: bool = Field(default=False)
    fator_piora_desc: str | None = None
    alerta_sinais_alarme_exibido: bool = Field(default=True)
    medidas_nao_farmacologicas_exibidas: bool = Field(default=True)
    solicitou_agendamento: bool = Field(default=False)


class PainTriageResponse(PainTriageCreate):
    """Resposta com dados completos da sessão de triagem."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    data_triagem: datetime
    status_atendimento: str


# ============================================================================
# CENTRAL DE ALERTAS CLÍNICOS
# ============================================================================

class ClinicalAlertBase(BaseModel):
    """Dados base de alerta assistencial."""
    tipo_alerta: str
    titulo: str
    descricao: str
    severidade: str = 'grave'  # grave, moderada, informativa
    estado: str = 'Novo'       # Novo, Em revisão, Tratado


class ClinicalAlertCreate(ClinicalAlertBase):
    pass


class ClinicalAlertUpdate(BaseModel):
    """Atualização de estado do alerta pela equipe de saúde."""
    estado: str = Field(description="Novo, Em revisão ou Tratado")
    revisado_por: str | None = None
    observacao_conduta: str | None = None


class ClinicalAlertResponse(ClinicalAlertBase):
    """Resposta detalhada do alerta com rastreabilidade."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    revisado_por: str | None = None
    observacao_conduta: str | None = None
    criado_em: datetime
    atualizado_em: datetime


# ============================================================================
# EVOLUÇÕES E PARECERES CLÍNICOS
# ============================================================================

class ClinicalNoteCreate(BaseModel):
    """Registro de evolução clínica multiprofissional."""
    profissional_nome: str
    cargo: str
    conselho_classe: str | None = None
    tipo_evolucao: str = 'Acompanhamento Domiciliar'
    conteudo: str
    conduta_plano: str | None = None


class ClinicalNoteResponse(ClinicalNoteCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    criado_em: datetime


# ============================================================================
# MAPA CORPORAL DE DOR E LESÃO
# ============================================================================

class PainMapCreate(BaseModel):
    """Registro anatômico de dor, edema ou lesão."""
    regiao_anatomica: str
    tipo_ocorrencia: str = 'dor'
    intensidade: int = 5
    foto_anexada_url: str | None = None
    observacao: str | None = None
    medicamento_associado: str | None = None


class PainMapResponse(PainMapCreate):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    criado_em: datetime


# ============================================================================
# MODELOS ORIGINAIS (MANTIDOS PARA COMPATIBILIDADE)
# ============================================================================

class SymptomBase(BaseModel):
    nome: str
    gravidade: str
    momento: str
    observacao: str | None = None


class SymptomCreate(SymptomBase):
    pass


class SymptomResponse(SymptomBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    atualizado_em: datetime
    user_id: int


class MedicationBase(BaseModel):
    nome: str
    dose: str
    horario: str
    frequencia: str
    observacao: str | None = None
    status: str = 'ativo'
    eh_dose_resgate: bool = False
    medico_prescritor: str | None = None
    vigencia: str | None = None


class MedicationCreate(MedicationBase):
    pass


class MedicationUpdate(BaseModel):
    nome: str | None = None
    dose: str | None = None
    horario: str | None = None
    frequencia: str | None = None
    observacao: str | None = None
    status: str | None = None
    eh_dose_resgate: bool | None = None
    medico_prescritor: str | None = None
    vigencia: str | None = None


class MedicationResponse(MedicationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    user_id: int


class OrientationBase(BaseModel):
    titulo: str
    descricao: str
    categoria: str
    prioridade: str


class OrientationCreate(OrientationBase):
    pass


class OrientationResponse(OrientationBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    atualizada_em: datetime
    user_id: int


class HealthResponse(BaseModel):
    status: str
    database: str
