/**
 * Tipos compartilhados pelo app mobile Zelo.
 *
 * Contratos centrais para as telas móveis e alinhamento com a escala ESAS
 * e o script clínico validado por juízes especialistas.
 */

export type GravidadeSintoma = 'leve' | 'moderada' | 'grave';
/**
 * Estados de medicação apresentados pelo app.
 */
export type StatusMedicacao = 'agendada' | 'tomada' | 'atrasada';
/**
 * Categorias visuais de orientação.
 */
export type CategoriaOrientacao = 'cuidados' | 'sintoma' | 'medicacao';
/**
 * Prioridades visuais usadas nos cards.
 */
export type PrioridadeOrientacao = 'baixa' | 'media' | 'alta';

/**
 * Registro local de sintoma genérico.
 */
export type Sintoma = {
  id: string;
  nome: string;
  gravidade: GravidadeSintoma;
  momento: string;
  observacao: string;
  atualizadoEm: string;
};

/**
 * Registro ESAS adaptado para a interface mobile.
 */
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

/**
 * Respostas que o app envia ao endpoint de triagem.
 */
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

/**
 * Ocorrência adaptada para o mapa mobile.
 */
export type LocalDor = {
  id: string;
  regiaoAnatomica: string;
  tipoOcorrencia: string;
  intensidade: number;
  observacao: string;
  medicamentoAssociado: string;
  criadoEm: string;
};

/**
 * Medicação exibida e manipulada pelas telas mobile.
 */
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

/**
 * Orientação retornada à área do paciente.
 */
export type Orientacao = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaOrientacao;
  prioridade: PrioridadeOrientacao;
  atualizadaEm: string;
};
