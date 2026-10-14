export type GravidadeSintoma = 'leve' | 'moderada' | 'grave';
export type StatusMedicacao = 'agendada' | 'tomada' | 'atrasada';
export type CategoriaOrientacao = 'cuidados' | 'sintoma' | 'medicacao';
export type PrioridadeOrientacao = 'baixa' | 'media' | 'alta';

export type Sintoma = {
  id: string;
  nome: string;
  gravidade: GravidadeSintoma;
  momento: string;
  observacao: string;
  atualizadoEm: string;
};

export type Medicacao = {
  id: string;
  nome: string;
  horario: string;
  dose: string;
  frequencia: string;
  observacao: string;
  status: StatusMedicacao;
};

export type Orientacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOrientacao;
  prioridade: PrioridadeOrientacao;
  atualizadaEm: string;
};
