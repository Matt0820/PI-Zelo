/**
 * Tipos compartilhados pelo app mobile.
 *
 * Este módulo funciona como contrato central para as telas. Ao manter cada dado
 * tipado aqui, o restante do app evita inconsistências de estrutura e facilita
 * a manutenção ao evoluir os modelos do sistema.
 */
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
