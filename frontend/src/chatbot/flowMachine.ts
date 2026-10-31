import { ChatbotAnswers, ChatbotNodeId, chatbotScript, emergencyGuidance, welcomeMessage } from './script';

export type ChatMessage = { id: string; role: 'assistant' | 'user'; text: string };
export type FlowPhase = 'welcome' | 'active' | 'emergency' | 'readyToSubmit';
type FlowSnapshot = Pick<ChatbotFlowState, 'phase' | 'nodeId' | 'messages' | 'answers'>;

export type ChatbotFlowState = {
  phase: FlowPhase;
  nodeId: ChatbotNodeId;
  messages: ChatMessage[];
  answers: ChatbotAnswers;
  history: FlowSnapshot[];
  error: string | null;
};

const emptyAnswers = (): ChatbotAnswers => ({
  emergencySigns: null,
  painCharacteristic: null,
  moreThanTwoWeeks: null,
  associatedSymptom: null,
  associatedSymptomDescription: null,
  aggravatingFactor: null,
  aggravatingFactorDescription: null,
  medicationsEffective: null,
  inTeamFollowUp: null,
  rescueDoseTaken: null,
  contactRequested: null,
});

const message = (role: ChatMessage['role'], text: string, index: number): ChatMessage => ({
  id: `${index}-${role}`,
  role,
  text,
});

export function createInitialFlow(name: string, pain: number): ChatbotFlowState {
  return {
    phase: 'welcome',
    nodeId: 'emergency',
    messages: [message('assistant', welcomeMessage(name, pain), 0)],
    answers: emptyAnswers(),
    history: [],
    error: null,
  };
}

function checkpoint(state: ChatbotFlowState): FlowSnapshot {
  return { phase: state.phase, nodeId: state.nodeId, messages: state.messages, answers: state.answers };
}

function enterNode(state: ChatbotFlowState, nodeId: ChatbotNodeId, messages: ChatMessage[], answers: ChatbotAnswers, history: FlowSnapshot[]) {
  const node = chatbotScript[nodeId];
  if (!node) return { ...state, phase: 'active' as const, messages, answers, history, error: 'Não foi possível continuar esta etapa. Reinicie a triagem.' };
  return {
    ...state,
    phase: 'active' as const,
    nodeId,
    messages: [...messages, message('assistant', node.prompt, messages.length)],
    answers,
    history,
    error: null,
  };
}

export function startFlow(state: ChatbotFlowState): ChatbotFlowState {
  if (state.phase !== 'welcome') return { ...state, error: 'A triagem já foi iniciada.' };
  return enterNode(state, 'emergency', state.messages, state.answers, [...state.history, checkpoint(state)]);
}

export function chooseFlowOption(state: ChatbotFlowState, optionId: string): ChatbotFlowState {
  if (state.phase !== 'active') return { ...state, error: 'Esta resposta não está disponível nesta etapa.' };
  const node = chatbotScript[state.nodeId];
  const option = node?.options?.find(item => item.id === optionId);
  if (!node || node.type !== 'choice' || !option) return { ...state, error: 'Resposta inválida. Escolha uma das opções exibidas.' };

  const answers = { ...state.answers, ...option.answer };
  const messages = [...state.messages, message('user', option.label, state.messages.length)];
  const history = [...state.history, checkpoint(state)];
  if (option.next === 'emergencyEnd') {
    return {
      ...state,
      phase: 'emergency',
      answers,
      messages: [...messages, message('assistant', emergencyGuidance, messages.length)],
      history,
      error: null,
    };
  }
  if (option.next === 'submit') {
    return { ...state, phase: 'readyToSubmit', answers, messages, history, error: null };
  }
  return enterNode(state, option.next, messages, answers, history);
}

export function submitFlowText(state: ChatbotFlowState, rawValue: string): ChatbotFlowState {
  if (state.phase !== 'active') return { ...state, error: 'O campo de resposta não está disponível nesta etapa.' };
  const node = chatbotScript[state.nodeId];
  const value = rawValue.trim();
  if (!node || node.type !== 'text' || !node.answerKey || !node.next) return { ...state, error: 'Não foi possível validar esta resposta. Reinicie a triagem.' };
  if (!value) return { ...state, error: 'Digite uma resposta antes de continuar.' };
  if (value.length > 200) return { ...state, error: 'A resposta deve ter até 200 caracteres.' };

  const answers = { ...state.answers, [node.answerKey]: value } as ChatbotAnswers;
  const messages = [...state.messages, message('user', value, state.messages.length)];
  const answeredState = { ...state, answers };
  return enterNode(state, node.next, messages, answers, [...state.history, checkpoint(answeredState)]);
}

export function continueFlow(state: ChatbotFlowState): ChatbotFlowState {
  if (state.phase !== 'active') return { ...state, error: 'Não há uma orientação para avançar nesta etapa.' };
  const node = chatbotScript[state.nodeId];
  if (!node || node.type !== 'info' || !node.next) return { ...state, error: 'Esta etapa não pode ser avançada. Reinicie a triagem.' };
  const messages = [...state.messages, message('user', 'Entendi, continuar', state.messages.length)];
  return enterNode(state, node.next, messages, state.answers, [...state.history, checkpoint(state)]);
}

export function goBackFlow(state: ChatbotFlowState): ChatbotFlowState {
  if (state.history.length === 0) return { ...state, phase: 'welcome', error: null };
  const previous = state.history[state.history.length - 1];
  return { ...state, ...previous, history: state.history.slice(0, -1), error: null };
}

export function restartFlow(name: string, pain: number): ChatbotFlowState {
  return createInitialFlow(name, pain);
}

export function toPainTriagePayload(answers: ChatbotAnswers, pain: number) {
  if (
    answers.emergencySigns !== false || answers.painCharacteristic === null || answers.moreThanTwoWeeks === null ||
    answers.associatedSymptom === null || answers.aggravatingFactor === null ||
    answers.medicationsEffective === null || answers.inTeamFollowUp === null ||
    answers.rescueDoseTaken === null || answers.contactRequested === null ||
    (answers.associatedSymptom && !answers.associatedSymptomDescription?.trim()) ||
    (answers.aggravatingFactor && !answers.aggravatingFactorDescription?.trim())
  ) return null;

  return {
    intensidade_dor: pain,
    caracteristica_dor: answers.painCharacteristic,
    mais_de_duas_semanas: answers.moreThanTwoWeeks,
    tipo_dor: answers.moreThanTwoWeeks ? 'cronica' : 'aguda',
    fez_dose_resgate: answers.rescueDoseTaken,
    medicamentos_efetivos: answers.medicationsEffective,
    em_acompanhamento: answers.inTeamFollowUp,
    tem_sintoma_acompanhante: answers.associatedSymptom,
    sintoma_acompanhante_desc: answers.associatedSymptom ? answers.associatedSymptomDescription?.trim() ?? null : null,
    tem_fator_piora: answers.aggravatingFactor,
    fator_piora_desc: answers.aggravatingFactor ? answers.aggravatingFactorDescription?.trim() ?? null : null,
    alerta_sinais_alarme_exibido: true,
    medidas_nao_farmacologicas_exibidas: true,
    solicitou_agendamento: answers.contactRequested,
  };
}
