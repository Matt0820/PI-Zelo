export type TriageSeverity = 'leve' | 'moderada' | 'grave';

export type PainCharacteristic = 'somatica' | 'neuropatica' | 'visceral' | 'outra';

export type PainDuration = 'aguda' | 'cronica';

export interface ChatbotAnswers {
  intensidadeDor: number;
  sintomaGatilho?: string;
  temSinaisEmergencia: boolean;
  caracteristicaDor: PainCharacteristic;
  duracaoDor: PainDuration;
  maisDeDuasSemanas: boolean;
  fezDoseResgate: boolean;
  medicamentosEfetivos: boolean;
  temSintomaAcompanhante: boolean;
  sintomaAcompanhanteDesc: string | null;
  temConstipacao: boolean;
  temFatorPiora: boolean;
  fatorPioraDesc: string | null;
  solicitarContato: boolean;
  observacoesAdicionais?: string;
}

export interface ChatOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  isEmergencyAlert?: boolean;
  action?: (currentAnswers: ChatbotAnswers) => Partial<ChatbotAnswers>;
  nextNodeId: string;
}

export interface ChatNode {
  id: string;
  speaker: 'zelo' | 'user';
  title?: string;
  message: string | ((answers: ChatbotAnswers, userName: string) => string);
  bullets?: string[];
  clinicalTip?: string | ((answers: ChatbotAnswers) => string | null);
  isEmergencyBlock?: boolean;
  options?: ChatOption[];
  isFinish?: boolean;
  allowCustomNote?: boolean;
}

export interface ChatHistoryEntry {
  id: string;
  nodeId: string;
  speaker: 'zelo' | 'user';
  message: string;
  bullets?: string[];
  clinicalTip?: string;
  timestamp: string;
  selectedOptionLabel?: string;
}
