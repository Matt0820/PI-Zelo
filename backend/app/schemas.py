"""Schemas de entrada e saída da API.

Os schemas atuam como contrato entre cliente e servidor: definem quais campos
são aceitos em cada requisição e qual estrutura é retornada em cada resposta.
Isso melhora validação, documentação automática e manutenção do backend.
"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    """Campos compartilhados em operações de usuário."""

    nome: str
    email: EmailStr


class UserCreate(UserBase):
    """Estrutura aceita na criação de um novo usuário."""

    senha: str


class UserLogin(BaseModel):
    """Payload usado para autenticação do usuário."""

    email: EmailStr
    senha: str


class UserResponse(UserBase):
    """Resposta pública do usuário após cadastro ou login."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    criado_em: datetime


class SymptomBase(BaseModel):
    """Dados base de um sintoma."""

    nome: str
    gravidade: str
    momento: str
    observacao: str | None = None


class SymptomCreate(SymptomBase):
    """Estrutura aceita para criação de um novo sintoma."""

    pass


class SymptomResponse(SymptomBase):
    """Resposta retornada ao consultar ou registrar um sintoma."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    atualizado_em: datetime
    user_id: int


class MedicationBase(BaseModel):
    """Dados base de medicamento."""

    nome: str
    dose: str
    horario: str
    frequencia: str
    observacao: str | None = None
    status: str


class MedicationCreate(MedicationBase):
    """Estrutura aceita para criação de medicação."""

    pass


class MedicationResponse(MedicationBase):
    """Resposta contendo os dados persistidos da medicação."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int


class OrientationBase(BaseModel):
    """Dados base de orientação do paciente ou cuidador."""

    titulo: str
    descricao: str
    categoria: str
    prioridade: str


class OrientationCreate(OrientationBase):
    """Estrutura aceita para incluir uma nova orientação."""

    pass


class OrientationResponse(OrientationBase):
    """Resposta com dados detalhados da orientação cadastrada."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    atualizada_em: datetime
    user_id: int


class HealthResponse(BaseModel):
    """Resposta simples da rota /health para verificação de disponibilidade."""

    status: str
    database: str
