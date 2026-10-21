/**
 * Tipos compartilhados pelo app mobile Zelo.
 *
 * Contratos centrais para as telas móveis e alinhamento com a escala ESAS
 * e o script clínico validado por juízes especialistas.
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

export type ESASAssessment = {
  id: string;
  dor: number;         // 0 a 10
  cansaco: number;     // 0 a 10
  nausea: number;      // 0 a 10
  depressao: number;   // 0 a 10
  ansiedade: number;   // 0 a 10
  sonolencia: number;  // 0 a 10
  apetite: number;     // 0 a 10
  mal_estar: number;   // 0 a 10
  falta_de_ar: number; // 0 a 10
  constipacao?: number;
  observacao?: string;
  acionouTriagem?: boolean;
  dataRegistro: string;
};

export type PainTriageData = {
  intensidadeDor: number;
  caracteristica: string;
  maisDeDuasSemanas: boolean;
  fezDoseResgate: boolean;
  medicamentosEfetivos: boolean;
  emAcompanhamento: boolean;
  temSintomaAcompanhante: boolean;
  sintomaAcompanhanteDesc?: string;
  temFatorPiora: boolean;
  fatorPioraDesc?: string;
  solicitouAgendamento: boolean;
};

export type Medicacao = {
  id: string;
  nome: string;
  horario: string;
  dose: string;
  frequencia: string;
  observacao: string;
  status: StatusMedicacao;
  ehDoseResgate?: boolean;
};

export type Orientacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOrientacao;
  prioridade: PrioridadeOrientacao;
  atualizadaEm: string;
};
