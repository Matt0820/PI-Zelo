/**
 * Define respostas, nós e opções usados pela árvore do chatbot web.
 */

export type TriageSeverity = 'leve' | 'moderada' | 'grave';

/**
 * Categorias de descrição da dor aceitas no fluxo.
 */
export type PainCharacteristic = 'somatica' | 'neuropatica' | 'visceral' | 'outra';

/**
 * Classificação de duração que o cliente envia ao backend.
 */
export type PainDuration = 'aguda' | 'cronica';

/**
 * Campos de resposta acumulados até a conclusão da triagem.
 */
export interface ChatbotAnswers {
  intensidadeDor: number;
  temSinaisEmergencia: boolean;
  caracteristicaDor: PainCharacteristic;
  duracaoDor: PainDuration;
  maisDeDuasSemanas: boolean;
  fezDoseResgate: boolean;
  medicamentosEfetivos: boolean;
  solicitarContato: boolean;
  observacoesAdicionais?: string;
}

/**
 * Resposta selecionável e próxima transição da árvore.
 */
export interface ChatOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  isEmergencyAlert?: boolean;
  action?: (currentAnswers: ChatbotAnswers) => Partial<ChatbotAnswers>;
  nextNodeId: string;
}

/**
 * Conteúdo e opções que definem uma etapa conversacional.
 */
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

/**
 * Mensagem exibida no histórico da conversa.
 */
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
