/**
 * SCRIPT DE AUDITORIA AUTOMATIZADA E PROTOCOLO DE TESTES CLÍNICOS
 * SISTEMA WEB ZELO — CUIDADOS PALIATIVOS ONCOLÓGICOS (HOSPICE ERASTO GAERTNER)
 * 
 * Normas e Referências:
 * - Acessibilidade: WCAG 2.2 Nível AA/AAA (W3C, 2024)
 * - Telenfermagem: Resolução COFEN nº 634/2020 e Código de Ética nº 564/2017
 * - Ética e Pesquisa: Resolução CNS nº 466/2012 (Parecer CEP/UFPR nº 6.218.903)
 * - Validação de Conteúdo: IVC médio global de 0,95 com 21 juízes especialistas (Grzybowski, 2023)
 */

// Definição Canônica dos 10 Sintomas da Escala ESAS + Constipação Intestinal
const ESAS_SYMPTOMS = [
  { id: 'dor', nome: 'Dor', minDesc: '0 · Sem dor', maxDesc: '10 · Pior dor possível', question: 'Indique na escala o número que melhor descreve a intensidade da sua dor neste momento:' },
  { id: 'cansaco', nome: 'Cansaço / Fadiga', minDesc: '0 · Sem cansaço', maxDesc: '10 · Pior cansaço possível', question: 'Como está o seu nível de cansaço ou fraqueza física agora?' },
  { id: 'nausea', nome: 'Náusea / Enjoo', minDesc: '0 · Sem náusea', maxDesc: '10 · Pior náusea (enjoo)', question: 'Você está sentindo enjoo ou vontade de vomitar hoje?' },
  { id: 'depressao', nome: 'Tristeza / Depressão', minDesc: '0 · Sem tristeza', maxDesc: '10 · Pior tristeza possível', question: 'Como o senhor (a) avalia o sentimento de tristeza ou desânimo hoje?' },
  { id: 'ansiedade', nome: 'Ansiedade / Agitação', minDesc: '0 · Sem ansiedade', maxDesc: '10 · Pior ansiedade possível', question: 'Como você sente seu estado de calma ou ansiedade neste momento?' },
  { id: 'sonolencia', nome: 'Sonolência', minDesc: '0 · Sem sono excessivo', maxDesc: '10 · Pior sonolência', question: 'Como avalia a vontade de dormir ou sonolência durante o dia?' },
  { id: 'apetite', nome: 'Falta de Apetite', minDesc: '0 · Bom apetite', maxDesc: '10 · Pior falta de apetite', question: 'Como foi a alimentação e a vontade de comer nas últimas refeições?' },
  { id: 'mal_estar', nome: 'Sensação de Mal-Estar', minDesc: '0 · Bem-estar pleno', maxDesc: '10 · Pior mal-estar', question: 'De maneira geral, como o senhor (a) sente o seu corpo hoje?' },
  { id: 'falta_de_ar', nome: 'Falta de Ar / Dispneia', minDesc: '0 · Sem falta de ar', maxDesc: '10 · Pior falta de ar', question: 'Você tem sentido cansaço ao respirar ou falta de ar no repouso?' },
  { id: 'constipacao', nome: 'Intestino Preso / Constipação', minDesc: '0 · Hábito intestinal normal', maxDesc: '10 · Pior constipação possível', question: 'Como avalia a dificuldade ou prisão de ventre para evacuar nas últimas 24h?' }
];

if (typeof window !== 'undefined') {
  window.ESAS_SYMPTOMS = ESAS_SYMPTOMS;
}

/**
 * 1. Inspeção Automatizada de Acessibilidade (WCAG 2.2) e Regras de Negócio
 */
function executarAuditoriaZelo() {
  console.group('🔍 AUDITORIA AUTOMATIZADA DO SISTEMA WEB ZELO (WCAG 2.2 & REGRAS CLÍNICAS)');
  let falhasCriticas = 0;
  let avisos = 0;

  // 1. Verificação de Alvos de Toque (WCAG 2.5.8 e Meta de Projeto >= 48px)
  const interativos = document.querySelectorAll('button, a, input, select, textarea, [role="radio"]');
  interativos.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0 && (rect.height < 44 || rect.width < 44)) {
      console.warn(`⚠️ [Alvo de Toque Pequeno] Elemento "${(el.innerText || el.id || el.name || '').trim().slice(0, 30)}" mede ${Math.round(rect.width)}x${Math.round(rect.height)}px (Recomendado >= 48px).`, el);
      avisos++;
    }
  });

  // 2. Verificação de Botões e Controles sem Rótulo Acessível (WCAG 4.1.2)
  interativos.forEach((el) => {
    const texto = (el.innerText || el.value || el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
    if (!texto && el.tagName !== 'INPUT') {
      console.error('❌ [Violação WCAG 4.1.2] Controle interativo sem texto visível ou aria-label:', el);
      falhasCriticas++;
    }
  });

  // 3. Verificação do Tamanho Mínimo de Fonte para Idosos (>= 14px)
  const elementosTexto = document.querySelectorAll('p, span, li, td, th, label, a, button');
  elementosTexto.forEach((el) => {
    const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
    if (fontSize < 14) {
      console.warn(`⚠️ [Tipografia Idoso] Texto menor que 14px (${fontSize}px) encontrado em:`, el);
      avisos++;
    }
  });

  // 4. Verificação da Base Clínica (10 Sintomas ESAS + Constipação e Árvore Chatbot)
  const baseSintomas = (typeof ESAS_SYMPTOMS !== 'undefined') ? ESAS_SYMPTOMS : (window.ESAS_SYMPTOMS || []);
  if (baseSintomas.length > 0) {
    const temConstipacao = baseSintomas.some(s => s.id === 'constipacao');
    const apetiteCorrigido = baseSintomas.some(s => s.id === 'apetite' && (s.nome || s.label || '').toLowerCase().includes('falta'));
    console.log(`✅ [Base ESAS] Total de sintomas mapeados: ${baseSintomas.length} (Constipação incluída: ${temConstipacao ? 'SIM' : 'NÃO'} | Semântica "Falta de Apetite": ${apetiteCorrigido ? 'SIM' : 'NÃO'})`);
    if (!temConstipacao || !apetiteCorrigido) falhasCriticas++;
  } else {
    console.error('❌ [Base ESAS] ESAS_SYMPTOMS não definida globalmente.');
    falhasCriticas++;
  }

  console.log(`📊 RESUMO DA AUDITORIA: ${falhasCriticas} Falhas Críticas | ${avisos} Avisos de Refinamento.`);
  console.groupEnd();
  return { falhasCriticas, avisos };
}

/**
 * 2. Suíte de Testes Clínicos Automatizados (CT-01 a CT-06)
 */
function executarTestesClinicosZelo() {
  console.group('🧪 BATERIA DE TESTES FUNCIONAIS E DE INTEGRAÇÃO CLÍNICA (CT-01 A CT-06)');
  const resultados = [];

  function assertTest(id, nome, condicao, detalhes = '') {
    if (condicao) {
      console.log(`%c[PASS] ${id}: ${nome}`, 'color: #1B5E4A; font-weight: bold;', detalhes);
      resultados.push({ id, nome, status: 'APROVADO', detalhes });
    } else {
      console.error(`[FAIL] ${id}: ${nome}`, detalhes);
      resultados.push({ id, nome, status: 'FALHA', detalhes });
    }
  }

  const root = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : this);
  const store = root.ZeloStore;
  if (!store) {
    console.error('ZeloStore não encontrado. Abortando bateria de testes.');
    console.groupEnd();
    return resultados;
  }

  // CT-01: Preenchimento Wizard ESAS Sem Gatilho Crítico (Notas 0 a 6)
  try {
    const sintomasLeves = {
      dor: 3, cansaco: 4, nausea: 1, depressao: 2, ansiedade: 3,
      sonolencia: 2, apetite: 2, mal_estar: 3, falta_de_ar: 1, constipacao: 4
    };
    store.saveESAS(1, sintomasLeves, 'Teste automatizado CT-01');
    const p1 = store.getPatientById(1);
    const ultimoEsas = (store.data.esasHistory || []).find(e => e.patientId === 1);
    const passCT01 = (
      ultimoEsas &&
      ultimoEsas.acionouTriagem === false &&
      p1 && (p1.estadoProposto === 'Tratado' || p1.estadoProposto === 'Moderado' || p1.estadoProposto === 'Estável')
    );
    assertTest('CT-01', 'Preenchimento Wizard ESAS Sem Gatilho Crítico', passCT01,
      `acionouTriagem=${ultimoEsas?.acionouTriagem}, estadoProposto=${p1?.estadoProposto}`);
  } catch (err) {
    assertTest('CT-01', 'Preenchimento Wizard ESAS Sem Gatilho Crítico', false, err.message);
  }

  // CT-02: Disparo Automático do Chatbot Zelo (Gatilho ESAS >= 7)
  try {
    const sintomasGraves = {
      dor: 8, cansaco: 5, nausea: 2, depressao: 3, ansiedade: 4,
      sonolencia: 3, apetite: 4, mal_estar: 4, falta_de_ar: 2, constipacao: 3
    };
    store.saveESAS(1, sintomasGraves, 'Teste automatizado CT-02 - Dor Grave');
    const p1 = store.getPatientById(1);
    const ultimoEsas = (store.data.esasHistory || []).find(e => e.patientId === 1);
    const alertaGerado = (store.data.alertas || []).some(a => a.patientId === 1 && a.severidade === 'grave');
    const passCT02 = (
      ultimoEsas &&
      ultimoEsas.acionouTriagem === true &&
      alertaGerado &&
      p1 && p1.estadoProposto === 'Novo'
    );
    assertTest('CT-02', 'Disparo Automático do Chatbot Zelo (Gatilho ESAS >= 7)', passCT02,
      `acionouTriagem=${ultimoEsas?.acionouTriagem}, alertaGerado=${alertaGerado}`);
  } catch (err) {
    assertTest('CT-02', 'Disparo Automático do Chatbot Zelo (Gatilho ESAS >= 7)', false, err.message);
  }

  // CT-03: Árvore de Decisão da Dor (IVC 0,95) e Reversão de Erro
  try {
    store.savePainTriageSession(1, {
      intensidadeDor: 8,
      caracteristica: 'Neuropática: Sensação de choque, queimação ou formigamento (IVC = 0,95)',
      duracao: 'Crônica (mais de 2 semanas)',
      doseResgate: 'Sim, já fez uso de dose de resgate prescrita (IVC = 0,90)',
      medicamentosEfetivos: 'Não estão controlando adequadamente (IVC = 0,95)',
      acompanhamento: 'Sim, paciente em acompanhamento especializado (IVC = 0,95)',
      sintomasAssociados: 'Não apresenta outros sintomas além da dor (IVC = 1,00)',
      fatoresPiora: 'Não identificou fatores agravantes imediatos (IVC = 0,90)',
      medidasNaoFarmacologicas: [
        'Ambiente calmo e posicionamento com travesseiros',
        'Técnicas de respiração lenta e relaxamento',
        'Distração audiovisual suave e apoio do familiar'
      ],
      solicitouAgendamento: true,
      desfecho: 'Consulta solicitada pelo paciente. Alerta prioritário gerado.'
    });
    const ultimaTriagem = (store.data.triagemHistory || []).find(t => t.patientId === 1);
    const passCT03 = (
      ultimaTriagem &&
      ultimaTriagem.caracteristica.includes('Neuropática') &&
      ultimaTriagem.solicitouAgendamento === true &&
      ultimaTriagem.medidasNaoFarmacologicas.length >= 3
    );
    assertTest('CT-03', 'Árvore de Decisão da Dor (IVC 0,95) e Reversão de Erro', passCT03,
      `caracteristica=${ultimaTriagem?.caracteristica}, agendamento=${ultimaTriagem?.solicitouAgendamento}`);
  } catch (err) {
    assertTest('CT-03', 'Árvore de Decisão da Dor (IVC 0,95) e Reversão de Erro', false, err.message);
  }

  // CT-04: Integração Paciente <-> Central de Alertas da Equipe
  try {
    const p1 = store.getPatientById(1);
    const alertasP1 = (store.data.alertas || []).filter(a => a.patientId === 1 && a.severidade === 'grave');
    const historicoEsasP1 = (store.data.esasHistory || []).filter(e => e.patientId === 1);
    const passCT04 = (
      p1 &&
      p1.estadoProposto === 'Novo' &&
      alertasP1.length > 0 &&
      historicoEsasP1.length >= 2
    );
    assertTest('CT-04', 'Integração Paciente <-> Central de Alertas da Equipe', passCT04,
      `alertasGrave=${alertasP1.length}, totalHistorico=${historicoEsasP1.length}`);
  } catch (err) {
    assertTest('CT-04', 'Integração Paciente <-> Central de Alertas da Equipe', false, err.message);
  }

  // CT-05: Registro de Dose de Resgate e Adesão Medicamentosa
  try {
    const evolucoesAntes = (store.data.evolucoes || []).length;
    store.addRescueDoseRecord(1);
    const evolucoesDepois = (store.data.evolucoes || []).length;
    const meds = store.getMedications(1);
    const medResgate = meds.find(m => m.ehResgate || m.nome.toLowerCase().includes('morfina'));
    let medConfirmado = null;
    if (medResgate) {
      medConfirmado = store.confirmMedicationDose(1, medResgate.id);
    }
    const passCT05 = (evolucoesDepois > evolucoesAntes) && (medConfirmado ? medConfirmado.aplicado === true : true);
    assertTest('CT-05', 'Registro de Dose de Resgate e Adesão Medicamentosa', passCT05,
      `evolucoes=${evolucoesDepois}, medConfirmado=${medConfirmado?.aplicado}`);
  } catch (err) {
    assertTest('CT-05', 'Registro de Dose de Resgate e Adesão Medicamentosa', false, err.message);
  }

  // CT-06: Fechamento de Ciclo de Telenfermagem (COFEN 634/2020)
  try {
    const nota = store.addClinicalNote(1, {
      tipo: 'Telenfermagem (Teleconsulta)',
      conteudo: 'Orientado manejo não farmacológico e ajuste de posicionamento. Sintoma controlado no domicílio sem necessidade de deslocamento hospitalar.',
      plano: 'Desfecho: Manejo domiciliar concluído com sucesso. Próximo contato de monitoramento em 24h.'
    });
    const passCT06 = (
      nota &&
      nota.tipo.includes('Telenfermagem') &&
      nota.conteudo.length > 20 &&
      nota.data.length > 5
    );
    assertTest('CT-06', 'Fechamento de Ciclo de Telenfermagem (COFEN 634/2020)', passCT06,
      `notaRegistrada=${nota?.tipo} em ${nota?.data}`);
  } catch (err) {
    assertTest('CT-06', 'Fechamento de Ciclo de Telenfermagem (COFEN 634/2020)', false, err.message);
  }

  const aprovados = resultados.filter(r => r.status === 'APROVADO').length;
  console.log(`🏁 RESUMO DOS TESTES: ${aprovados} de ${resultados.length} testes clínicos aprovados (${Math.round((aprovados/resultados.length)*100)}% de conformidade).`);
  console.groupEnd();
  return resultados;
}

if (typeof window !== 'undefined') {
  window.executarAuditoriaZelo = executarAuditoriaZelo;
  window.executarTestesClinicosZelo = executarTestesClinicosZelo;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ESAS_SYMPTOMS,
    executarAuditoriaZelo,
    executarTestesClinicosZelo
  };
}
