from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserBase(BaseModel):
    nome: str
    email: EmailStr


class UserCreate(UserBase):
    senha: str


class UserLogin(BaseModel):
    email: EmailStr
    senha: str


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ativo: bool
    criado_em: datetime


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
    status: str


class MedicationCreate(MedicationBase):
    pass


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
