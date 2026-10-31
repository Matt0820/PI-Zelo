import { ChatNode, ChatbotAnswers } from './types';

export const INITIAL_CHATBOT_ANSWERS: ChatbotAnswers = {
  intensidadeDor: 8,
  temSinaisEmergencia: false,
  caracteristicaDor: 'somatica',
  duracaoDor: 'aguda',
  maisDeDuasSemanas: false,
  fezDoseResgate: false,
  medicamentosEfetivos: false,
  solicitarContato: false,
  observacoesAdicionais: ''
};

export const CHATBOT_SCRIPT_TREE: Record<string, ChatNode> = {
  // NÓ 1: ACOLHIMENTO E CONTEXTUALIZAÇÃO DO GATILHO ESAS
  'acolhimento': {
    id: 'acolhimento',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Acolhimento Imediato',
    message: (answers, userName) =>
      `Olá, ${userName.split(' ')[0]}. Identificamos que você registrou um sintoma com intensidade forte (nota ${answers.intensidadeDor}/10). Estou aqui para ajudar a avaliar e direcionar o seu alívio agora no domicílio.`,
    options: [
      {
        id: 'opt_iniciar',
        label: 'Iniciar Triagem e Orientações de Alívio ›',
        nextNodeId: 'triagem_emergencia'
      }
    ]
  },

  // NÓ 2: TRIAGEM BLOQUEANTE DE SINAIS DE EMERGÊNCIA / ALERTA VERMELHO
  'triagem_emergencia': {
    id: 'triagem_emergencia',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Checagem de Segurança',
    message:
      'Antes de seguirmos com as medidas de alívio no domicílio, preciso checar se há alguma dessas 4 situações graves acontecendo com você neste momento:',
    bullets: [
      '1. Queda recente com suspeita de fratura ou batida na cabeça;',
      '2. Perda repentina de força ou de sensibilidade nas pernas ou braços;',
      '3. Feridas bolhosas novas com muita dor na pele;',
      '4. Sonolência excessiva em que você quase não consegue acordar após tomar morfina/remédio forte.'
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

  // NÓ 3: SEMIOLOGIA SENSORIAL DA DOR (VALIDADA POR JUÍZES - )
  'semiologia_dor': {
    id: 'semiologia_dor',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Avaliação da Dor',
    message:
      'Para direcionarmos a melhor orientação de cuidado, como você descreve a sensação dessa dor que está sentindo agora?',
    options: [
      {
        id: 'opt_dor_somatica',
        label: 'Parece uma pontada, aperto no corpo ou sensação de facada',
        sublabel: 'Dor muscular, óssea ou articular',
        action: () => ({ caracteristicaDor: 'somatica' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_neuropatica',
        label: 'Parece queimação, choque elétrico ou formigamento',
        sublabel: 'Dor nos nervos, queimação ou irradiação',
        action: () => ({ caracteristicaDor: 'neuropatica' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_visceral',
        label: 'Parece uma cólica ou dor espalhada por dentro da barriga',
        sublabel: 'Dor em órgãos internos ou cólica',
        action: () => ({ caracteristicaDor: 'visceral' }),
        nextNodeId: 'temporalidade_dor'
      },
      {
        id: 'opt_dor_outra',
        label: 'Outra sensação / Não consigo definir exatamente',
        sublabel: 'Desconforto geral ou outra manifestação',
        action: () => ({ caracteristicaDor: 'outra' }),
        nextNodeId: 'temporalidade_dor'
      }
    ]
  },

  // NÓ 4: TEMPORALIDADE DA DOR (AGUDA VS. CRÔNICA - )
  'temporalidade_dor': {
    id: 'temporalidade_dor',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Duração do Sintoma',
    message:
      'Essa dor começou há mais de 2 semanas (dor contínua/crônica) ou começou há poucos dias/hoje (dor aguda nova)?',
    options: [
      {
        id: 'opt_duracao_cronica',
        label: 'Sim, essa dor começou há mais de 2 semanas (Crônica)',
        action: () => ({ duracaoDor: 'cronica', maisDeDuasSemanas: true }),
        nextNodeId: 'manejo_resgate'
      },
      {
        id: 'opt_duracao_aguda',
        label: 'Não, começou há poucos dias ou hoje (Dor Aguda)',
        action: () => ({ duracaoDor: 'aguda', maisDeDuasSemanas: false }),
        nextNodeId: 'manejo_resgate'
      }
    ]
  },

  // NÓ 5: MANEJO FARMACOLÓGICO E DOSE DE RESGATE
  'manejo_resgate': {
    id: 'manejo_resgate',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Uso de Medicamentos',
    message:
      'Você já fez uso da dose de resgate (medicamento extra prescrito pelo médico para alívio rápido da dor forte) hoje? E os remédios habituais estão ajudando?',
    options: [
      {
        id: 'opt_resgate_tomado_sem_alivio',
        label: 'Já tomei a dose de resgate, mas a dor continua forte',
        action: () => ({ fezDoseResgate: true, medicamentosEfetivos: false }),
        nextNodeId: 'conforto_nao_farmacologico'
      },
      {
        id: 'opt_resgate_nao_tomado',
        label: 'Ainda não tomei a dose de resgate prescrita',
        action: () => ({ fezDoseResgate: false, medicamentosEfetivos: false }),
        nextNodeId: 'conforto_nao_farmacologico'
      },
      {
        id: 'opt_resgate_tomado_com_alivio',
        label: 'Tomei o resgate e já estou sentindo alívio gradual',
        action: () => ({ fezDoseResgate: true, medicamentosEfetivos: true }),
        nextNodeId: 'conforto_nao_farmacologico'
      }
    ]
  },

  // NÓ 6: MEDIDAS NÃO FARMACOLÓGICAS BASEADAS EM EVIDÊNCIAS
  'conforto_nao_farmacologico': {
    id: 'conforto_nao_farmacologico',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Medidas Práticas de Conforto',
    message:
      'Enquanto a medicação age no organismo, adote imediatamente estas medidas práticas de alívio validadas pela equipe de cuidados paliativos:',
    bullets: [
      'Posicionamento do corpo: Coloque travesseiros macios sob as pernas ou na lombar para aliviar a pressão muscular.',
      'Respiração suave: Puxe o ar devagar pelo nariz contando mentalmente até 3 e solte suavemente pela boca.',
      'Ambiente calmo: Diminua luzes diretas no quarto, feche janelas para ruídos externos e coloque uma música suave.',
      'Hidratação e apoio: Beba pequenos goles de água e mantenha um familiar cuidador próximo para apoio e segurança.'
    ],
    clinicalTip: answers =>
      !answers.fezDoseResgate
        ? 'Dica clínica importante: Se o seu médico prescreveu medicação de resgate para dor forte, este é o momento adequado para fazer uso conforme a posologia da sua receita.'
        : 'Como você já tomou o resgate, aguarde cerca de 30 a 45 minutos para o pico de ação da medicação enquanto repousa.',
    options: [
      {
        id: 'opt_continuar_desfecho',
        label: 'Continuar para Finalizar e Registrar ›',
        nextNodeId: 'desfecho_contato'
      }
    ]
  },

  // NÓ 7: DESFECHO CLÍNICO E SOLICITAÇÃO DE CONTATO DA EQUIPE
  'desfecho_contato': {
    id: 'desfecho_contato',
    speaker: 'zelo',
    title: 'Enfermeira Virtual Zelo · Desfecho Assistencial',
    message:
      'Deseja solicitar que a equipe multiprofissional do Equipe Médica entre em contato prioritário com você por telefone ou mensagem neste turno?',
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

  // NÓ 8: CONCLUSÃO E TRANSMISSÃO DO CASO AO PRONTUÁRIO
  'conclusao': {
    id: 'conclusao',
    speaker: 'zelo',
    title: 'Triagem Finalizada · Registrado no Prontuário',
    isFinish: true,
    message: (answers) =>
      answers.solicitarContato
        ? 'Suas respostas foram salvas no prontuário do Equipe Médica. Foi gerado um alerta prioritário na Central da equipe de saúde para retorno ágil.'
        : 'Suas respostas foram salvas com sucesso no seu prontuário diário para monitoramento contínuo da equipe do Equipe Médica.',
    bullets: [
      'As medidas não farmacológicas permanecem salvas para consulta.',
      'Se a dor aumentar ou surgirem novos sintomas, você pode refazer a avaliação a qualquer momento.',
      'Em caso de agravamento súbito, ligue para o Equipe Médica: (41) 3333-0000.'
    ]
  }
};
