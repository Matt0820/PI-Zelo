export type ChatbotNodeId =
  | 'emergency'
  | 'painCharacteristic'
  | 'duration'
  | 'associatedSymptom'
  | 'associatedSymptomDescription'
  | 'aggravatingFactor'
  | 'aggravatingFactorDescription'
  | 'medicationEffectiveness'
  | 'teamFollowUp'
  | 'rescueDose'
  | 'comfortMeasures'
  | 'contactRequest';

export type ChatbotAnswers = {
  emergencySigns: boolean | null;
  painCharacteristic: 'somatica' | 'neuropatica' | 'visceral' | 'nenhuma' | null;
  moreThanTwoWeeks: boolean | null;
  associatedSymptom: boolean | null;
  associatedSymptomDescription: string | null;
  aggravatingFactor: boolean | null;
  aggravatingFactorDescription: string | null;
  medicationsEffective: boolean | null;
  inTeamFollowUp: boolean | null;
  rescueDoseTaken: boolean | null;
  contactRequested: boolean | null;
};

export type ChatbotOption = {
  id: string;
  label: string;
  answer?: Partial<ChatbotAnswers>;
  next: ChatbotNodeId | 'emergencyEnd' | 'submit';
};

export type ChatbotNode = {
  prompt: string;
  type: 'choice' | 'text' | 'info';
  content?: string[];
  options?: ChatbotOption[];
  answerKey?: 'associatedSymptomDescription' | 'aggravatingFactorDescription';
  next?: ChatbotNodeId;
};

export const chatbotScript: Record<ChatbotNodeId, ChatbotNode> = {
  emergency: {
    type: 'choice',
    prompt: 'Está acontecendo alguma destas situações agora: queda recente ou suspeita de fratura; perda de movimentos ou sensibilidade nas pernas ou pés; sonolência profunda ou dificuldade para acordar após ingerir morfina?',
    options: [
      { id: 'yes', label: 'Sim, alguma dessas situações está acontecendo', answer: { emergencySigns: true }, next: 'emergencyEnd' },
      { id: 'no', label: 'Não aconteceu nenhuma dessas situações', answer: { emergencySigns: false }, next: 'painCharacteristic' },
    ],
  },
  painCharacteristic: {
    type: 'choice',
    prompt: 'Como você descreveria a sensação dessa dor?',
    options: [
      { id: 'somatica', label: 'Pontada, aperto ou facada em um ponto definido (somática)', answer: { painCharacteristic: 'somatica' }, next: 'duration' },
      { id: 'neuropatica', label: 'Queimação, choque ou formigamento (neuropática)', answer: { painCharacteristic: 'neuropatica' }, next: 'duration' },
      { id: 'visceral', label: 'Cólica ou dor espalhada por dentro (visceral)', answer: { painCharacteristic: 'visceral' }, next: 'duration' },
      { id: 'none', label: 'Nenhuma dessas opções', answer: { painCharacteristic: 'nenhuma' }, next: 'duration' },
    ],
  },
  duration: {
    type: 'choice',
    prompt: 'Essa dor começou há mais de duas semanas?',
    options: [
      { id: 'yes', label: 'Sim, começou há mais de duas semanas', answer: { moreThanTwoWeeks: true }, next: 'associatedSymptom' },
      { id: 'no', label: 'Não, começou há poucos dias ou hoje', answer: { moreThanTwoWeeks: false }, next: 'associatedSymptom' },
    ],
  },
  associatedSymptom: {
    type: 'choice',
    prompt: 'Há algum outro sintoma que acompanha a dor?',
    options: [
      { id: 'yes', label: 'Sim, há outro sintoma', answer: { associatedSymptom: true }, next: 'associatedSymptomDescription' },
      { id: 'no', label: 'Não há outro sintoma', answer: { associatedSymptom: false, associatedSymptomDescription: null }, next: 'aggravatingFactor' },
    ],
  },
  associatedSymptomDescription: {
    type: 'text',
    prompt: 'Qual sintoma acompanha a dor?',
    answerKey: 'associatedSymptomDescription',
    next: 'aggravatingFactor',
  },
  aggravatingFactor: {
    type: 'choice',
    prompt: 'Há algum fator ou atividade que aumenta ou piora a dor?',
    options: [
      { id: 'yes', label: 'Sim, há algo que piora a dor', answer: { aggravatingFactor: true }, next: 'aggravatingFactorDescription' },
      { id: 'no', label: 'Não identifiquei fator de piora', answer: { aggravatingFactor: false, aggravatingFactorDescription: null }, next: 'medicationEffectiveness' },
    ],
  },
  aggravatingFactorDescription: {
    type: 'text',
    prompt: 'O que aumenta ou piora a dor?',
    answerKey: 'aggravatingFactorDescription',
    next: 'medicationEffectiveness',
  },
  medicationEffectiveness: {
    type: 'choice',
    prompt: 'Os medicamentos habituais estão sendo efetivos na maior parte do dia?',
    options: [
      { id: 'yes', label: 'Sim, estão sendo efetivos', answer: { medicationsEffective: true }, next: 'teamFollowUp' },
      { id: 'no', label: 'Não estão controlando a dor adequadamente', answer: { medicationsEffective: false }, next: 'teamFollowUp' },
    ],
  },
  teamFollowUp: {
    type: 'choice',
    prompt: 'Você já está em acompanhamento com a equipe do Hospice?',
    options: [
      { id: 'yes', label: 'Sim, estou em acompanhamento', answer: { inTeamFollowUp: true }, next: 'rescueDose' },
      { id: 'no', label: 'Não estou em acompanhamento', answer: { inTeamFollowUp: false }, next: 'rescueDose' },
    ],
  },
  rescueDose: {
    type: 'choice',
    prompt: 'Você já fez uso da dose de resgate prescrita para hoje?',
    options: [
      { id: 'yes', label: 'Sim, já usei a dose de resgate', answer: { rescueDoseTaken: true }, next: 'comfortMeasures' },
      { id: 'no', label: 'Ainda não usei a dose de resgate', answer: { rescueDoseTaken: false }, next: 'comfortMeasures' },
    ],
  },
  comfortMeasures: {
    type: 'info',
    prompt: 'Enquanto a equipe acompanha você, confira estas medidas de conforto:',
    content: [
      'Use travesseiros para encontrar uma posição confortável e aliviar pontos de pressão.',
      'Faça respirações suaves e lentas, sem forçar.',
      'Mantenha o ambiente calmo e, se desejar, use música, leitura ou conversa tranquila como distração.',
      'Peça apoio ao familiar cuidador e use medicamentos somente conforme a prescrição recebida.',
    ],
    next: 'contactRequest',
  },
  contactRequest: {
    type: 'choice',
    prompt: 'Deseja solicitar contato prioritário da equipe ou agendamento?',
    options: [
      { id: 'yes', label: 'Sim, solicitar contato prioritário', answer: { contactRequested: true }, next: 'submit' },
      { id: 'no', label: 'Não, vou aguardar e seguir as orientações', answer: { contactRequested: false }, next: 'submit' },
    ],
  },
};

export const emergencyGuidance = 'Você informou um sinal de alerta. A triagem foi interrompida para priorizar atendimento imediato.';
export const welcomeMessage = (name: string, pain: number) =>
  `Olá, ${name}. Você informou Dor nota ${pain}/10 na escala ESAS. Vou fazer algumas perguntas para orientar o conforto e registrar suas respostas para a equipe.`;
