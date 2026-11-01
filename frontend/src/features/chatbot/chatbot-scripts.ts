import { ChatNode, ChatbotAnswers } from './types';

export const INITIAL_CHATBOT_ANSWERS: ChatbotAnswers = {
  intensidadeDor: 8,
  sintomaGatilho: 'dor',
  temSinaisEmergencia: false,
  caracteristicaDor: 'somatica',
  duracaoDor: 'aguda',
  maisDeDuasSemanas: false,
  fezDoseResgate: false,
  medicamentosEfetivos: false,
  temSintomaAcompanhante: false,
  sintomaAcompanhanteDesc: null,
  temConstipacao: false,
  temFatorPiora: false,
  fatorPioraDesc: null,
  solicitarContato: false,
  observacoesAdicionais: ''
};

export const CHATBOT_SCRIPT_TREE: Record<string, ChatNode> = {
  // NÓ 1: ACOLHIMENTO E CONTEXTUALIZAÇÃO DO GATILHO ESAS
  'acolhimento': {
    id: 'acolhimento',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Acolhimento Imediato',
    message: (answers, userName) => {
      const primeiroNome = userName.split(' ')[0];
      if (answers.sintomaGatilho === 'constipacao' || answers.temConstipacao) {
        return `Olá, ${primeiroNome}. Identificamos que você registrou constipação intestinal (intestino preso) em intensidade alta (nota ${answers.intensidadeDor}/10). Em cuidados paliativos, a prisão de ventre ligada ao uso contínuo de opioides precisa de acolhimento e alívio rápido. Estou aqui para orientar seu cuidado no domicílio.`;
      }
      return `Olá, ${primeiroNome}. Identificamos que você registrou um sintoma com intensidade forte (nota ${answers.intensidadeDor}/10). Estou aqui para ajudar a avaliar e direcionar o seu alívio agora no domicílio.`;
    },
    options: [
      {
        id: 'opt_iniciar',
        label: 'Iniciar Triagem e Orientações de Alívio ›',
        nextNodeId: 'triagem_emergencia'
      }
    ]
  },

  // NÓ 2: TRIAGEM BLOQUEANTE DE SINAIS DE EMERGÊNCIA / ALERTA VERMELHO (IVC = 1,00)
  'triagem_emergencia': {
    id: 'triagem_emergencia',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Checagem de Segurança',
    message:
      'Antes de seguirmos com as medidas de alívio no domicílio, preciso checar se há alguma dessas situações de alerta grave acontecendo agora:',
    bullets: [
      '1. Queda recente com suspeita de fratura ou pancada na cabeça;',
      '2. Perda repentina de força ou sensibilidade nas pernas ou braços;',
      '3. Sonolência profunda ou quase não conseguir acordar após tomar morfina/remédio forte;',
      '4. Mais de 3 dias sem evacuar nem eliminar gases, acompanhado de barriga dura, muito inchada ou vômitos.'
    ],
    options: [
      {
        id: 'opt_emergencia_sim',
        label: 'Sim, alguma dessas situações graves está acontecendo',
        isEmergencyAlert: true,
        action: () => ({ temSinaisEmergencia: true }),
        nextNodeId: 'bloqueio_emergencia'
      },
      {
        id: 'opt_emergencia_nao',
        label: 'Não aconteceu nenhuma dessas situações (Continuar)',
        action: () => ({ temSinaisEmergencia: false }),
        nextNodeId: 'semiologia_dor'
      }
    ]
  },

  // NÓ 2B: BLOQUEIO PROTETOR DE EMERGÊNCIA (ALERTA VERMELHO)
  'bloqueio_emergencia': {
    id: 'bloqueio_emergencia',
    speaker: 'zelo',
    title: 'Aviso Clínico de Urgência · Equipe Médica',
    isEmergencyBlock: true,
    message:
      'Identificamos um sinal de alerta prioritário que necessita de avaliação presencial imediata da nossa equipe médica e de enfermagem. Por favor, não espere em casa: ligue agora para o plantão da equipe médica ou dirija-se ao pronto-atendimento hospitalar.',
    bullets: [
      'Plantão Telefônico da Equipe Médica: (41) 3333-0000',
      'Endereço: Central de Atendimento e Suporte Clínico',
      'Leve sua receita médica mais recente e o documento do paciente.'
    ],
    options: [
      {
        id: 'opt_corrigir_emergencia',
        label: 'Corrigir: Não tenho nenhuma dessas situações graves',
        action: () => ({ temSinaisEmergencia: false }),
        nextNodeId: 'semiologia_dor'
      }
    ]
  },

  // NÓ 3: SEMIOLOGIA SENSORIAL DA DOR E DESCONFORTO (VALIDADA POR JUÍZES - IVC = 0,91 A 1,00)
  'semiologia_dor': {
    id: 'semiologia_dor',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Avaliação da Sensação',
    message: (answers) =>
      answers.sintomaGatilho === 'constipacao'
        ? 'Como você descreveria o desconforto ou dor na região da barriga neste momento?'
        : 'Para direcionarmos a melhor orientação de cuidado, como você descreve a sensação dessa dor que está sentindo agora?',
    options: [
      {
        id: 'opt_dor_visceral',
        label: 'Parece uma cólica, peso ou dor espalhada por dentro da barriga',
        sublabel: 'Desconforto visceral típico em abdômen ou constipação intestinal (IVC = 0,91)',
        action: () => ({ caracteristicaDor: 'visceral' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_somatica',
        label: 'Parece uma pontada, aperto ou sensação de facada em ponto definido',
        sublabel: 'Dor somática em ossos, músculos ou articulações (IVC = 1,00)',
        action: () => ({ caracteristicaDor: 'somatica' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_neuropatica',
        label: 'Parece queimação, choque elétrico ou formigamento',
        sublabel: 'Dor neuropática em nervos ou queimação contínua (IVC = 0,95)',
        action: () => ({ caracteristicaDor: 'neuropatica' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_outra',
        label: 'Outra sensação / Desconforto geral ou dificuldade de evacuar',
        sublabel: 'Desconforto geral ou outra manifestação clínica',
        action: () => ({ caracteristicaDor: 'outra' }),
        nextNodeId: 'temporalidade_dor'
      }
    ]
  },

  // NÓ 4: TEMPORALIDADE (AGUDA VS. CRÔNICA - IVC = 0,91)
  'temporalidade_dor': {
    id: 'temporalidade_dor',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Duração do Sintoma',
    message:
      'Esse desconforto começou há mais de 2 semanas (dor/sintoma contínuo ou crônico) ou começou há poucos dias/hoje (quadro agudo recente)?',
    options: [
      {
        id: 'opt_duracao_cronica',
        label: 'Sim, começou há mais de 2 semanas (Crônico)',
        sublabel: 'Sintoma persistente ou contínuo há mais de 14 dias',
        action: () => ({ duracaoDor: 'cronica', maisDeDuasSemanas: true }),
        nextNodeId: 'sintomas_acompanhantes'
      },
      {
        id: 'opt_duracao_aguda',
        label: 'Não, começou há poucos dias ou hoje (Agudo)',
        sublabel: 'Início recente ou piora súbita',
        action: () => ({ duracaoDor: 'aguda', maisDeDuasSemanas: false }),
        nextNodeId: 'sintomas_acompanhantes'
      }
    ]
  },

  // NÓ 5: SINTOMAS ACOMPANHANTES E CONSTIPAÇÃO (VALIDADO POR JUÍZES - IVC = 1,00)
  'sintomas_acompanhantes': {
    id: 'sintomas_acompanhantes',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Sintomas Acompanhantes (IVC = 1,00)',
    message:
      'Além do sintoma principal, você está apresentando algum outro desconforto associado, como intestino preso (constipação), enjoo ou cansaço?',
    options: [
      {
        id: 'opt_acompanhante_constipacao',
        label: 'Sim, estou com constipação intestinal (intestino preso há dias)',
        sublabel: 'Sintoma muito comum e prevalente pelo uso contínuo de opioides',
        action: () => ({
          temSintomaAcompanhante: true,
          temConstipacao: true,
          sintomaAcompanhanteDesc: 'Constipação intestinal / intestino preso associado'
        }),
        nextNodeId: 'manejo_resgate'
      },
      {
        id: 'opt_acompanhante_nausea',
        label: 'Sim, sinto enjoo, náusea ou cansaço intenso',
        sublabel: 'Desconforto gástrico ou fadiga corporal',
        action: () => ({
          temSintomaAcompanhante: true,
          temConstipacao: false,
          sintomaAcompanhanteDesc: 'Náusea / cansaço associado'
        }),
        nextNodeId: 'manejo_resgate'
      },
      {
        id: 'opt_acompanhante_nenhum',
        label: 'Não apresento outro sintoma associado no momento',
        sublabel: 'Apenas a manifestação inicial relatada',
        action: () => ({
          temSintomaAcompanhante: false,
          temConstipacao: false,
          sintomaAcompanhanteDesc: null
        }),
        nextNodeId: 'manejo_resgate'
      }
    ]
  },

  // NÓ 6: MANEJO FARMACOLÓGICO E DOSE DE RESGATE (IVC = 0,90 E 0,95)
  'manejo_resgate': {
    id: 'manejo_resgate',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Uso de Medicamentos',
    message: (answers) =>
      answers.temConstipacao || answers.sintomaGatilho === 'constipacao'
        ? 'Você já fez uso do laxativo de rotina ou dose de alívio prescrita pelo médico hoje? E os medicamentos habituais estão funcionando?'
        : 'Você já fez uso da dose de resgate (medicamento extra prescrito pelo médico para alívio rápido da dor forte) hoje? E os remédios habituais estão ajudando?',
    options: [
      {
        id: 'opt_resgate_tomado_sem_alivio',
        label: 'Já tomei a medicação prescrita hoje, mas o desconforto continua forte',
        sublabel: 'Dose administrada sem controle adequado',
        action: () => ({ fezDoseResgate: true, medicamentosEfetivos: false }),
        nextNodeId: 'conforto_nao_farmacologico'
      },
      {
        id: 'opt_resgate_nao_tomado',
        label: 'Ainda não tomei a dose de alívio/resgate prescrita para hoje',
        sublabel: 'Medicação de resgate ou laxativo ainda não administrado',
        action: () => ({ fezDoseResgate: false, medicamentosEfetivos: false }),
        nextNodeId: 'conforto_nao_farmacologico'
      },
      {
        id: 'opt_resgate_tomado_com_alivio',
        label: 'Tomei a medicação e já estou sentindo alívio gradual',
        sublabel: 'Efeito terapêutico perceptível em andamento',
        action: () => ({ fezDoseResgate: true, medicamentosEfetivos: true }),
        nextNodeId: 'conforto_nao_farmacologico'
      }
    ]
  },

  // NÓ 7: MEDIDAS NÃO FARMACOLÓGICAS BASEADAS EM EVIDÊNCIAS
  'conforto_nao_farmacologico': {
    id: 'conforto_nao_farmacologico',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Medidas Práticas de Conforto',
    message:
      'Enquanto a medicação age no organismo, adote imediatamente estas medidas práticas de alívio validadas pela equipe de cuidados paliativos:',
    bullets: [
      'Posicionamento do corpo: Coloque travesseiros macios sob as pernas ou lombar para aliviar a tensão abdominal e muscular.',
      'Alívio para Constipação: Beba pequenos goles de água morna ou chás suaves. Ao sentar no vaso sanitário, coloque um banquinho baixo sob os pés para elevar os joelhos, facilitando a evacuação sem esforço.',
      'Massagem abdominal circular: Faça massagem suave e relaxante sobre a barriga, em círculos no sentido horário (dos ponteiros do relógio).',
      'Respiração suave: Puxe o ar devagar pelo nariz contando mentalmente até 3 e solte suavemente pela boca.',
      'Ambiente calmo e apoio: Diminua luzes diretas no quarto, feche ruídos externos e mantenha um familiar cuidador por perto.'
    ],
    clinicalTip: answers => {
      if (answers.temConstipacao || answers.sintomaGatilho === 'constipacao') {
        return 'Dica clínica importante: Em uso de analgésicos opioides, o intestino fica naturalmente preguiçoso. Mantenha os laxativos de rotina prescritos e nunca force a evacuação se houver dor intensa.';
      }
      return !answers.fezDoseResgate
        ? 'Dica clínica importante: Se o seu médico prescreveu medicação de resgate para dor forte, este é o momento adequado para fazer uso conforme a posologia da sua receita.'
        : 'Como você já tomou o resgate, aguarde cerca de 30 a 45 minutos para o pico de ação da medicação enquanto repousa.';
    },
    options: [
      {
        id: 'opt_continuar_desfecho',
        label: 'Continuar para Finalizar e Registrar ›',
        nextNodeId: 'desfecho_contato'
      }
    ]
  },

  // NÓ 8: DESFECHO CLÍNICO E SOLICITAÇÃO DE CONTATO DA EQUIPE (IVC = 0,95)
  'desfecho_contato': {
    id: 'desfecho_contato',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Desfecho Assistencial',
    message:
      'Deseja solicitar que a equipe multiprofissional da Equipe Médica entre em contato prioritário com você por telefone ou mensagem neste turno?',
    options: [
      {
        id: 'opt_contato_sim',
        label: 'Sim, quero solicitar contato prioritário da equipe',
        action: () => ({ solicitarContato: true }),
        nextNodeId: 'conclusao'
      },
      {
        id: 'opt_contato_nao',
        label: 'Não, vou aplicar as medidas de conforto e aguardar o alívio',
        action: () => ({ solicitarContato: false }),
        nextNodeId: 'conclusao'
      }
    ]
  },

  // NÓ 9: CONCLUSÃO E TRANSMISSÃO DO CASO AO PRONTUÁRIO
  'conclusao': {
    id: 'conclusao',
    speaker: 'zelo',
    title: 'Triagem Finalizada · Registrado no Prontuário',
    isFinish: true,
    message: (answers) =>
      answers.solicitarContato
        ? 'Suas respostas foram salvas no prontuário da Equipe Médica. Foi gerado um alerta prioritário na Central da equipe de saúde para retorno ágil.'
        : 'Suas respostas foram salvas com sucesso no seu prontuário diário para monitoramento contínuo da Equipe Médica.',
    bullets: [
      'As medidas não farmacológicas de alívio e cuidados com o intestino permanecem salvas para consulta.',
      'Se a dor ou constipação aumentarem ou surgirem novos sintomas, você pode refazer a avaliação a qualquer momento.',
      'Em caso de agravamento súbito, ligue para a Equipe Médica: (41) 3333-0000.'
    ]
  }
};
