/**
 * REPOSITORIO E GERENCIADOR DE DADOS REATIVOS DO SISTEMA ZELO
 * Suporta persistencia hibrida: API FastAPI (porta 8000) com sincronizacao SQLite e fallback para LocalStorage.
 * Estruturado a partir das caracteristicas clinicas da pesquisa de base.
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

const ZeloStore = {
  apiBaseUrl: window.location.origin && window.location.origin.startsWith('http') 
    ? window.location.origin 
    : 'http://localhost:8000',
  isApiOnline: false,

  initialData: {
    currentUser: {
      id: 100,
      nome: 'Enf. Bruna Tres',
      cargo: 'Enfermeira Especialista em Cuidados Paliativos',
      conselho: 'COREN-PR 330719',
      perfil: 'assistencial',
      email: 'bruna.enfermagem@zelo.saude.gov.br'
    },
    pacientes: [
      {
        id: 1,
        identificador: 'Paciente 01',
        nome: 'Leovegildo Coimbra Nunes',
        idade: 74,
        sexo: 'Masculino',
        prontuario: '001',
        cpf: '123.456.789-00',
        telefone: '(41) 98713-2808',
        cuidador: 'Carlos Nunes (Filho)',
        parentesco: 'Filho(a)',
        diagnostico: 'Neoplasia Maligna de Prostata (CID-10 C61)',
        pps: 70,
        comorbidades: 'HAS, Diabetes Mellitus tipo 2',
        alergias: 'Dipirona sodica',
        tratamento: 'Cuidados Paliativos Exclusivos',
        proximaConsulta: '18/10/2026 as 10:00 (Dra. Ana)',
        ultimoRegistro: '09/10/2026 · 09:00',
        estadoProposto: 'Novo',
        sintomaCritico: 'Dor 8/10 (Grave)',
        resumoInfo: 'Registro ESAS disponivel ->'
      },
      {
        id: 2,
        identificador: 'Paciente 02',
        nome: 'Maria Helena Fagundes',
        idade: 68,
        sexo: 'Feminino',
        prontuario: '002',
        cpf: '234.567.890-11',
        telefone: '(41) 99123-4567',
        cuidador: 'Roberto Fagundes (Conjuge)',
        parentesco: 'Conjuge',
        diagnostico: 'Neoplasia de Colon e Reto (CID-10 C18)',
        pps: 60,
        comorbidades: 'HAS, Cardiopatia Isquemica',
        alergias: 'Sem alergias relatadas',
        tratamento: 'Cuidados Paliativos Exclusivos',
        proximaConsulta: '22/10/2026 as 14:00',
        ultimoRegistro: '08/10/2026 · 14:00',
        estadoProposto: 'Em revisao',
        sintomaCritico: 'Dor 5/10 e Constipacao',
        resumoInfo: 'Resposta de dor disponivel ->'
      },
      {
        id: 3,
        identificador: 'Paciente 03',
        nome: 'Joao Batista da Silva',
        idade: 81,
        sexo: 'Masculino',
        prontuario: '003',
        cpf: '345.678.901-22',
        telefone: '(41) 98845-6789',
        cuidador: 'Ana Paula da Silva (Filha)',
        parentesco: 'Filho(a)',
        diagnostico: 'Neoplasia Pulmonar / Bronquica (CID-10 C34)',
        pps: 40,
        comorbidades: 'DPOC, Hipertensao',
        alergias: 'Sem relatos',
        tratamento: 'Cuidados Paliativos Exclusivos',
        proximaConsulta: '25/10/2026 as 09:30',
        ultimoRegistro: '07/10/2026 · 10:00',
        estadoProposto: 'Tratado',
        sintomaCritico: 'Falta de ar 6/10',
        resumoInfo: 'Exemplo de revisao concluida ->'
      },
      {
        id: 4,
        identificador: 'Paciente 04',
        nome: 'Alzira Pereira dos Santos',
        idade: 79,
        sexo: 'Feminino',
        prontuario: '004',
        cpf: '456.789.012-33',
        telefone: '(41) 99678-1234',
        cuidador: 'Sem acompanhante fixo',
        parentesco: 'Proprio paciente',
        diagnostico: 'Neoplasia de Mama (CID-10 C50)',
        pps: 80,
        comorbidades: 'HAS, Osteoporose',
        alergias: 'Iodo',
        tratamento: 'Cuidados Paliativos Exclusivos',
        proximaConsulta: '29/10/2026 as 11:00',
        ultimoRegistro: 'Sem registro recente',
        estadoProposto: 'Sem registro',
        sintomaCritico: 'Nenhum sintoma registrado',
        resumoInfo: 'Ainda sem resposta ESAS ->'
      }
    ],

    esasHistory: [
      {
        id: 101,
        patientId: 1,
        data: '09/10/2026 · 09:00',
        dataIso: '2026-10-09T09:00:00',
        sintomas: {
          dor: 8, cansaco: 5, nausea: 2, depressao: 3, ansiedade: 4, sonolencia: 3, apetite: 4, mal_estar: 4, falta_de_ar: 1, constipacao: 2
        },
        acionouTriagem: true
      },
      {
        id: 102,
        patientId: 1,
        data: '08/10/2026 · 09:00',
        dataIso: '2026-10-08T09:00:00',
        sintomas: {
          dor: 5, cansaco: 6, nausea: 2, depressao: 3, ansiedade: 5, sonolencia: 4, apetite: 4, mal_estar: 5, falta_de_ar: 2, constipacao: 3
        },
        acionouTriagem: false
      },
      {
        id: 103,
        patientId: 1,
        data: '07/10/2026 · 09:00',
        dataIso: '2026-10-07T09:00:00',
        sintomas: {
          dor: 3, cansaco: 5, nausea: 1, depressao: 2, ansiedade: 3, sonolencia: 3, apetite: 3, mal_estar: 3, falta_de_ar: 1, constipacao: 2
        },
        acionouTriagem: false
      }
    ],

    triagemHistory: [
      {
        id: 201,
        patientId: 1,
        data: '09/10/2026 · 09:10',
        intensidadeDor: 8,
        caracteristica: 'Somatica: Sensacao de pontada, aperto ou facada (IVC = 1,00)',
        duracao: 'Aguda (comecou ha menos de 02 semanas - IVC = 0,91)',
        doseResgate: 'Sim, ja fez uso de dose de resgate prescrita (IVC = 0,90)',
        medicamentosEfetivos: 'Nao, medicamentos nao estao sendo efetivos na maior parte do dia (IVC = 0,95)',
        acompanhamento: 'Sim, ja esta em acompanhamento com a equipe especializada (IVC = 0,95)',
        sintomasAssociados: 'Nao ha outros sintomas acompanhantes alem da dor (IVC = 1,00)',
        fatoresPiora: 'Sim, percebeu piora da dor ao se levantar ou movimentar no leito (IVC = 0,90)',
        medidasNaoFarmacologicas: [
          'Intervencoes comportamentais e suporte empatico',
          'Tecnicas de relaxamento e respiracao suave',
          'Manutencao do ambiente calmo e posicao confortavel no leito',
          'Formas de distracao (televisao, livros, musica ambiente relaxante)'
        ],
        solicitouAgendamento: true,
        desfecho: 'Paciente solicitou consulta com a equipe especializada. Alerta prioritario gerado.'
      }
    ],

    alertas: [
      {
        id: 1,
        patientId: 1,
        pacienteNome: 'Paciente 01 (Leovegildo Coimbra Nunes)',
        prontuario: '001',
        titulo: 'Registro ESAS disponivel - Dor 8/10',
        descricao: 'Paciente informou DOR em intensidade 8 (Dor Somatica: pontada/aperto). Fez dose de resgate sem alivio satisfatorio. Solicitou agendamento de consulta com a equipe.',
        data: '09/10/2026 · 09:00',
        estado: 'Novo',
        severidade: 'grave',
        motivo: 'Gatilho ESAS Dor >= 7 acionado no domicilio',
        revisadoPor: null,
        condutaRegistrada: null
      },
      {
        id: 2,
        patientId: 2,
        pacienteNome: 'Paciente 02 (Maria Helena Fagundes)',
        prontuario: '002',
        titulo: 'Resposta de dor disponivel - Categoria visceral',
        descricao: 'Paciente informou dor moderada em colica (5/10) e constipacao intestinal persistente. Conjuge Roberto esta ciente.',
        data: '08/10/2026 · 14:00',
        estado: 'Em revisao',
        severidade: 'moderada',
        motivo: 'Resposta de dor moderada e constipacao',
        revisadoPor: 'Enf. Bruna Tres',
        condutaRegistrada: 'Entrado em contato com o conjuge Roberto; orientado aumento de ingesta hidrica e uso de laxativo prescrito.'
      }
    ],

    medicamentos: [
      {
        id: 1,
        patientId: 1,
        nome: 'Codeina 30mg',
        posologia: '1 comprimido a cada 6h',
        horario: '08:00, 14:00, 20:00, 02:00',
        status: 'Tomado as 08:00',
        aplicado: true,
        ehResgate: false,
        medico: 'Dr. Alexandre Prado (CRM/PR 24890)',
        vigencia: '14/11/2026'
      },
      {
        id: 2,
        patientId: 1,
        nome: 'Gabapentina 300mg',
        posologia: '1 capsula a cada 12h',
        horario: '08:00, 20:00',
        status: 'Tomado as 08:00',
        aplicado: true,
        ehResgate: false,
        medico: 'Dr. Alexandre Prado (CRM/PR 24890)',
        vigencia: '14/11/2026'
      },
      {
        id: 3,
        patientId: 1,
        nome: 'Morfina 10mg (Dose de Resgate)',
        posologia: '1 comprimido se dor aguda intensa',
        horario: 'Se necessario (intervalo min. 4h)',
        status: 'Dose tomada as 08:30 (sem alivio)',
        aplicado: true,
        ehResgate: true,
        medico: 'Dr. Alexandre Prado (CRM/PR 24890)',
        vigencia: '14/11/2026'
      },
      {
        id: 4,
        patientId: 1,
        nome: 'Paracetamol 500mg',
        posologia: '1 comprimido a cada 6h se dor leve',
        horario: 'Conforme demanda',
        status: 'Prescricao ativa',
        aplicado: false,
        ehResgate: false,
        medico: 'Dr. Alexandre Prado (CRM/PR 24890)',
        vigencia: '14/11/2026'
      }
    ],

    locaisDor: [
      {
        id: 1,
        patientId: 1,
        data: '09/10/2026 · 09:15',
        tipo: 'Dor',
        regiao: 'Coluna Lombar / Costas',
        observacao: 'Dor somática profunda irradiando para membros inferiores.'
      }
    ],

    evolucoes: [
      {
        id: 1,
        patientId: 1,
        data: '09/10/2026 · 09:30',
        autor: 'Enf. Bruna Tres',
        cargo: 'Enfermeira Especialista em Cuidados Paliativos (COREN-PR 330719)',
        tipo: 'Telemonitoramento de Enfermagem (Resolucao Cofen 634/2020)',
        conteudo: 'Contato telefonico realizado com o cuidador (filho Carlos). Paciente em decubito dorsal com queixa de dor intensa em regiao lombar/escapular (ESAS dor 8). Orientado posicionamento em decubito lateral com travesseiros sob joelhos, aplicacao de medidas de relaxamento e ingestao da dose de resgate prescrita.',
        plano: 'Reavaliar sintomas em 2 horas. Caso nao ocorra alivio ou surjam sinais de alerta (sonolencia profunda, retencao urinaria ou perda de sensibilidade nos pes), orientada procura imediata ao Pronto Atendimento.'
      }
    ]
  },

  async init() {
    this.loadFromStorage();
    await this.checkApiStatus();
    if (this.isApiOnline) {
      await this.syncWithBackend();
    }
    this.updatePatientBottomNavBadges();
    window.addEventListener('storage', () => {
      this.loadFromStorage();
      this.updatePatientBottomNavBadges();
    });
    window.addEventListener('zelo:data-changed', () => {
      this.updatePatientBottomNavBadges();
    });
  },

  updatePatientBottomNavBadges() {
    try {
      const avisosLink = document.querySelector('.bottom-nav-item[href*="notificacoes.html"]');
      if (!avisosLink) return;

      const patId = Number(localStorage.getItem('zelo_selected_patient_id') || 1);
      const notifs = this.getPatientNotifications(patId);
      const pendentes = notifs.filter(n => n.tipo === 'esas_pendente' || (n.tipo === 'medicamento' && !n.aplicado) || n.tipo === 'equipe');
      
      let badge = avisosLink.querySelector('.nav-badge-pill');
      if (pendentes.length > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'nav-badge-pill';
          badge.style.cssText = 'background: #C53030; color: #FFFFFF; border-radius: 10px; padding: 1px 6px; font-size: 0.72rem; font-weight: 800; margin-left: 4px; display: inline-block; vertical-align: middle;';
          const labelSpan = avisosLink.querySelector('span:last-child');
          if (labelSpan) labelSpan.appendChild(badge);
        }
        badge.textContent = pendentes.length;
        badge.style.display = 'inline-block';
      } else if (badge) {
        badge.style.display = 'none';
      }
    } catch (e) {
      // silencioso se DOM ainda nao pronto
    }
  },

  loadFromStorage() {
    try {
      const data = localStorage.getItem('zelo_system_db');
      if (data) {
        this.data = JSON.parse(data);
      } else {
        this.data = JSON.parse(JSON.stringify(this.initialData));
        this.saveToStorage();
      }
    } catch (e) {
      console.warn('Erro ao ler LocalStorage Zelo, recarregando padrao:', e);
      this.data = JSON.parse(JSON.stringify(this.initialData));
      this.saveToStorage();
    }
  },

  saveToStorage() {
    try {
      localStorage.setItem('zelo_system_db', JSON.stringify(this.data));
      window.dispatchEvent(new CustomEvent('zelo:data-changed', { detail: this.data }));
    } catch (e) {
      console.error('Erro ao salvar LocalStorage Zelo:', e);
    }
  },

  // Alias para compatibilidade total
  saveData() {
    return this.saveToStorage();
  },

  async checkApiStatus() {
    try {
      const resp = await fetch(`${this.apiBaseUrl}/api`, { method: 'GET', signal: AbortSignal.timeout(1800) });
      if (resp.ok) {
        this.isApiOnline = true;
        console.log('[ZeloStore] API FastAPI conectada com sucesso em', this.apiBaseUrl);
      }
    } catch (e) {
      this.isApiOnline = false;
      console.log('[ZeloStore] API offline, operando em modo LocalStorage seguro.');
    }
  },

  async syncWithBackend() {
    try {
      // 1. Carrega usuários/pacientes cadastrados no SQLite
      const respUsers = await fetch(`${this.apiBaseUrl}/api/users`, { signal: AbortSignal.timeout(2000) });
      if (respUsers.ok) {
        const users = await respUsers.json();
        const pacientesDb = users.filter(u => u.perfil === 'paciente');
        
        pacientesDb.forEach(u => {
          let p = this.data.pacientes.find(item => item.id === u.id || item.prontuario === u.prontuario);
          if (!p) {
            p = {
              id: u.id,
              identificador: `Paciente ${String(u.id).padStart(2, '0')}`,
              nome: u.nome,
              idade: u.idade || 70,
              sexo: u.sexo || 'Indefinido',
              prontuario: u.prontuario || String(u.id),
              cpf: u.cpf || '---',
              telefone: u.telefone || '---',
              cuidador: u.cuidador_principal ? `${u.cuidador_principal} (${u.parentesco_cuidador || 'Familiar'})` : 'Proprio paciente',
              parentesco: u.parentesco_cuidador || 'Familiar',
              diagnostico: u.diagnostico_oncologico || 'Neoplasia em Cuidados Paliativos',
              pps: u.pps_score || 70,
              comorbidades: u.comorbidades || 'HAS',
              alergias: u.alergias || 'Nao relatadas',
              tratamento: 'Cuidados Paliativos Exclusivos',
              proximaConsulta: u.proxima_consulta || 'A definir',
              ultimoRegistro: 'Sem registro recente',
              estadoProposto: 'Sem registro',
              sintomaCritico: 'Sem avaliacao recente',
              resumoInfo: 'Paciente cadastrado no sistema ->'
            };
            this.data.pacientes.push(p);
          }
        });
      }

      // 2. Carrega alertas do banco SQLite
      const respAlerts = await fetch(`${this.apiBaseUrl}/api/alertas`, { signal: AbortSignal.timeout(2000) });
      if (respAlerts.ok) {
        const alertasDb = await respAlerts.json();
        alertasDb.forEach(a => {
          if (!this.data.alertas.find(item => item.id === a.id)) {
            const p = this.getPatientById(a.user_id);
            this.data.alertas.unshift({
              id: a.id,
              patientId: a.user_id,
              pacienteNome: p ? `${p.identificador} (${p.nome})` : `Paciente ${a.user_id}`,
              prontuario: p ? p.prontuario : '---',
              titulo: a.titulo,
              descricao: a.descricao,
              data: new Date(a.criado_em).toLocaleString('pt-BR'),
              estado: a.status === 'novo' ? 'Novo' : (a.status === 'em_revisao' ? 'Em revisao' : 'Tratado'),
              severidade: a.gravidade,
              motivo: a.descricao,
              revisadoPor: a.revisado_por,
              condutaRegistrada: a.conduta
            });
          }
        });
      }

      this.saveToStorage();
    } catch (e) {
      console.warn('[ZeloStore] Sincronização parcial com backend:', e);
    }
  },

  getPatients() {
    return this.data.pacientes || [];
  },

  getPatientById(id) {
    return this.getPatients().find(p => p.id === Number(id)) || null;
  },

  addPatient(patientData) {
    if (!this.data.pacientes) this.data.pacientes = [];
    const newId = this.data.pacientes.length > 0 
      ? Math.max(...this.data.pacientes.map(p => p.id)) + 1 
      : 1;

    const newPatient = {
      id: newId,
      identificador: `Paciente ${String(newId).padStart(2, '0')}`,
      nome: patientData.nome,
      idade: Number(patientData.idade) || 70,
      sexo: patientData.sexo || 'Indefinido',
      prontuario: patientData.prontuario || String(newId).padStart(3, '0'),
      cpf: patientData.cpf || '000.000.000-00',
      telefone: patientData.telefone || '(41) 90000-0000',
      cuidador: patientData.cuidador || 'Proprio paciente',
      parentesco: patientData.parentesco || 'Familiar',
      diagnostico: patientData.diagnostico || 'Neoplasia em Cuidados Paliativos',
      pps: Number(patientData.pps) || 70,
      comorbidades: patientData.comorbidades || 'HAS',
      alergias: patientData.alergias || 'Nenhuma informada',
      tratamento: 'Cuidados Paliativos Domiciliares',
      proximaConsulta: patientData.proximaConsulta || 'A agendar com a equipe',
      ultimoRegistro: 'Recem cadastrado',
      estadoProposto: 'Sem registro',
      sintomaCritico: 'Aguardando primeira avaliacao ESAS',
      resumoInfo: 'Paciente cadastrado com sucesso ->'
    };

    this.data.pacientes.unshift(newPatient);
    this.saveToStorage();

    // Sincroniza com backend REST SQLite se disponível
    if (this.isApiOnline) {
      fetch(`${this.apiBaseUrl}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newPatient.nome,
          email: `${newPatient.nome.toLowerCase().replace(/[^a-z0-9]/g, '.')}@zelo.saude.gov.br`,
          senha: 'zelo' + newId,
          perfil: 'paciente',
          prontuario: newPatient.prontuario,
          idade: newPatient.idade,
          sexo: newPatient.sexo,
          cpf: newPatient.cpf,
          telefone: newPatient.telefone,
          cuidador_principal: newPatient.cuidador,
          parentesco_cuidador: newPatient.parentesco,
          diagnostico_oncologico: newPatient.diagnostico,
          pps_score: newPatient.pps,
          comorbidades: newPatient.comorbidades,
          alergias: newPatient.alergias
        })
      }).catch(err => console.warn('Erro ao sincronizar paciente no backend:', err));
    }

    return newPatient;
  },

  getAlerts(filterState = null) {
    let list = this.data.alertas || [];
    if (filterState && filterState !== 'todos') {
      list = list.filter(a => a.estado.toLowerCase() === filterState.toLowerCase());
    }
    return list;
  },

  getAlertById(id) {
    return (this.data.alertas || []).find(a => a.id === Number(id));
  },

  getESASHistory(patientId) {
    return (this.data.esasHistory || []).filter(e => e.patientId === Number(patientId));
  },

  getPainTriageHistory(patientId) {
    return (this.data.triagemHistory || []).filter(t => t.patientId === Number(patientId));
  },

  getMedications(patientId) {
    return (this.data.medicamentos || []).filter(m => m.patientId === Number(patientId));
  },

  addMedication(patientId, medData) {
    if (!this.data.medicamentos) {
      this.data.medicamentos = [];
    }
    const newId = this.data.medicamentos.length > 0 
      ? Math.max(...this.data.medicamentos.map(m => m.id)) + 1 
      : 1;

    const newMed = {
      id: newId,
      patientId: Number(patientId),
      nome: medData.nome,
      posologia: medData.posologia,
      horario: medData.horario,
      status: medData.status || 'Ativo / Programado',
      aplicado: false,
      ehResgate: Boolean(medData.ehResgate),
      medico: medData.medico || 'Dr. Alexandre Prado (CRM/PR 24890)',
      vigencia: medData.vigencia || '30 dias',
      observacao: medData.observacao || ''
    };

    this.data.medicamentos.unshift(newMed);
    this.saveToStorage();

    if (this.isApiOnline) {
      fetch(`${this.apiBaseUrl}/api/users/${patientId}/medications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: newMed.nome,
          dose: newMed.posologia,
          horario: newMed.horario,
          frequencia: newMed.horario,
          observacao: newMed.observacao,
          status: 'ativo',
          eh_dose_resgate: newMed.ehResgate,
          medico_prescritor: newMed.medico,
          vigencia: newMed.vigencia
        })
      }).catch(() => {});
    }

    return newMed;
  },

  getClinicalNotes(patientId) {
    return (this.data.evolucoes || []).filter(ev => ev.patientId === Number(patientId));
  },

  updateAlertStatus(alertId, newStatus, reviewerName, conduta = null) {
    const alert = this.getAlertById(alertId);
    if (!alert) return false;

    alert.estado = newStatus;
    if (reviewerName) alert.revisadoPor = reviewerName;
    if (conduta) alert.condutaRegistrada = conduta;
    alert.atualizadoEm = new Date().toLocaleString('pt-BR');

    const paciente = this.getPatientById(alert.patientId);
    if (paciente) {
      paciente.estadoProposto = newStatus;
    }

    this.saveToStorage();
    return true;
  },

  addClinicalNote(patientId, note) {
    const newNote = {
      id: Date.now(),
      patientId: Number(patientId),
      data: new Date().toLocaleString('pt-BR'),
      autor: note.autor || this.data.currentUser.nome,
      cargo: note.cargo || this.data.currentUser.cargo,
      tipo: note.tipo || 'Acompanhamento Domiciliar',
      conteudo: note.conteudo,
      plano: note.plano || 'Seguimento domiciliar.'
    };
    this.data.evolucoes.unshift(newNote);
    this.saveToStorage();

    if (this.isApiOnline) {
      fetch(`${this.apiBaseUrl}/api/users/${patientId}/evolucoes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: newNote.tipo,
          conteudo: newNote.conteudo,
          plano_terapeutico: newNote.plano,
          profissional_nome: newNote.autor,
          conselho_profissional: 'COREN-PR 330719'
        })
      }).catch(() => {});
    }

    return newNote;
  },

  saveESAS(patientId, sintomas, observacao = '') {
    const scores = Object.values(sintomas).map(v => Number(v) || 0);
    const maxScore = scores.length > 0 ? Math.max(...scores) : 0;
    const acionou = (maxScore >= 7);
    const nowStr = new Date().toLocaleString('pt-BR');
    const newEsas = {
      id: Date.now(),
      patientId: Number(patientId),
      data: nowStr,
      dataIso: new Date().toISOString(),
      sintomas: { ...sintomas },
      observacao,
      acionouTriagem: acionou
    };

    if (!this.data.esasHistory) this.data.esasHistory = [];
    this.data.esasHistory.unshift(newEsas);

    const paciente = this.getPatientById(patientId);
    if (paciente) {
      paciente.ultimoRegistro = nowStr;
      const dorNum = Number(sintomas.dor) || 0;
      paciente.sintomaCritico = `Dor ${dorNum}/10 (${dorNum >= 7 ? 'Grave' : (dorNum >= 4 ? 'Moderada' : 'Leve')})`;
      if (acionou) {
        paciente.estadoProposto = 'Novo';
        paciente.resumoInfo = 'Sintoma grave registrado (ESAS >= 7) ->';
      } else if (maxScore >= 4) {
        paciente.estadoProposto = 'Moderado';
        paciente.resumoInfo = 'Sintomas moderados sob controle ->';
      } else {
        paciente.estadoProposto = 'Tratado';
        paciente.resumoInfo = 'Registro ESAS atualizado (Estável) ->';
      }
    }

    if (acionou) {
      const novoAlerta = {
        id: Date.now(),
        patientId: Number(patientId),
        pacienteNome: paciente ? `${paciente.identificador} (${paciente.nome})` : `Paciente ${patientId}`,
        prontuario: paciente ? paciente.prontuario : '---',
        titulo: `Registro ESAS disponivel - Dor ${sintomas.dor}/10`,
        descricao: `${paciente ? paciente.nome : 'Paciente'} informou nivel de DOR ${sintomas.dor}/10 na escala ESAS. Gatilho de triagem domiciliar ativado.`,
        data: nowStr,
        estado: 'Novo',
        severidade: 'grave',
        motivo: `Dor em intensidade ${sintomas.dor}/10 (Gatilho ESAS)`,
        revisadoPor: null,
        condutaRegistrada: null
      };
      if (!this.data.alertas) this.data.alertas = [];
      this.data.alertas.unshift(novoAlerta);
    }

    this.saveToStorage();

    // Sincroniza com o backend FastAPI SQLite se disponível
    if (this.isApiOnline) {
      fetch(`${this.apiBaseUrl}/api/users/${patientId}/esas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dor: Number(sintomas.dor) || 0,
          cansaco: Number(sintomas.cansaco) || 0,
          nausea: Number(sintomas.nausea) || 0,
          depressao: Number(sintomas.depressao) || 0,
          ansiedade: Number(sintomas.ansiedade) || 0,
          sonolencia: Number(sintomas.sonolencia) || 0,
          apetite: Number(sintomas.apetite) || 0,
          mal_estar: Number(sintomas.mal_estar) || 0,
          falta_de_ar: Number(sintomas.falta_de_ar) || 0,
          observacoes: observacao
        })
      }).catch(err => console.warn('Erro ao sincronizar ESAS no backend:', err));
    }

    return newEsas;
  },

  savePainTriageSession(patientId, sessionData) {
    const nowStr = new Date().toLocaleString('pt-BR');
    const newSession = {
      id: Date.now(),
      patientId: Number(patientId),
      data: nowStr,
      ...sessionData
    };

    if (!this.data.triagemHistory) this.data.triagemHistory = [];
    this.data.triagemHistory.unshift(newSession);

    const paciente = this.getPatientById(patientId);
    if (paciente) {
      paciente.ultimoRegistro = nowStr;
      paciente.estadoProposto = 'Novo';
      paciente.resumoInfo = 'Triagem de dor concluida - Agendamento solicitado ->';
    }

    const alerta = {
      id: Date.now() + 1,
      patientId: Number(patientId),
      pacienteNome: paciente ? `${paciente.identificador} (${paciente.nome})` : `Paciente ${patientId}`,
      prontuario: paciente ? paciente.prontuario : '---',
      titulo: `Triagem Chatbot Zelo - Dor ${sessionData.intensidadeDor}/10`,
      descricao: `Triagem concluida: ${sessionData.caracteristica}. Duracao: ${sessionData.duracao}. Dose de resgate: ${sessionData.doseResgate}. ${sessionData.solicitouAgendamento ? 'SOLICITOU AGENDAMENTO DA EQUIPE.' : ''}`,
      data: nowStr,
      estado: 'Novo',
      severidade: 'grave',
      motivo: 'Triagem de dor severa domiciliar',
      revisadoPor: null,
      condutaRegistrada: null
    };
    if (!this.data.alertas) this.data.alertas = [];
    this.data.alertas.unshift(alerta);

    this.saveToStorage();

    if (this.isApiOnline) {
      const durStr = String(sessionData.duracao || '').toLowerCase();
      const maisDe2 = durStr.includes('mais de 2') || durStr.includes('crônica') || durStr.includes('cronica');
      const caracStr = String(sessionData.caracteristica || '').toLowerCase();
      let caracClean = 'somatica';
      if (caracStr.includes('neuro')) caracClean = 'neuropatica';
      else if (caracStr.includes('visc')) caracClean = 'visceral';
      else if (caracStr.includes('nenhum')) caracClean = 'nenhuma';

      fetch(`${this.apiBaseUrl}/api/users/${patientId}/triagem-dor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intensidade_dor: Math.min(10, Math.max(7, Number(sessionData.intensidadeDor) || 8)),
          caracteristica_dor: caracClean,
          mais_de_duas_semanas: maisDe2,
          tipo_dor: maisDe2 ? 'cronica' : 'aguda',
          fez_dose_resgate: String(sessionData.doseResgate).toLowerCase().includes('sim'),
          medicamentos_efetivos: String(sessionData.medicamentosEfetivos).toLowerCase().includes('sim'),
          em_acompanhamento: true,
          tem_sintoma_acompanhante: Boolean(sessionData.sintomasAssociados && !String(sessionData.sintomasAssociados).toLowerCase().includes('não')),
          sintoma_acompanhante_desc: sessionData.sintomasAssociados || null,
          tem_fator_piora: Boolean(sessionData.fatoresPiora && !String(sessionData.fatoresPiora).toLowerCase().includes('não')),
          fator_piora_desc: sessionData.fatoresPiora || null,
          alerta_sinais_alarme_exibido: true,
          medidas_nao_farmacologicas_exibidas: true,
          solicitou_agendamento: Boolean(sessionData.solicitouAgendamento)
        })
      }).catch(err => console.warn('Erro ao sincronizar triagem de dor no backend:', err));
    }

    return newSession;
  },

  savePainMapEntry(patientId, entry) {
    if (!this.data.locaisDor) this.data.locaisDor = [];
    const nowStr = new Date().toLocaleString('pt-BR');
    const newEntry = {
      id: Date.now(),
      patientId: Number(patientId),
      data: nowStr,
      tipo: entry.tipo || 'Dor',
      regiao: entry.regiao,
      observacao: entry.observacao || ''
    };
    this.data.locaisDor.unshift(newEntry);

    const paciente = this.getPatientById(patientId);
    if (paciente) {
      paciente.ultimoRegistro = nowStr;
      paciente.estadoProposto = 'Novo';
    }

    // Registra nota clínica para a equipe
    this.addClinicalNote(patientId, {
      tipo: `Registro de Local de ${entry.tipo}`,
      conteudo: `Paciente ou cuidador apontou queixa de ${entry.tipo} na regiao: ${entry.regiao} as ${nowStr}.`,
      plano: 'Avaliar regiao corporal informada no proximo contato assistencial.'
    });

    this.saveToStorage();

    if (this.isApiOnline) {
      fetch(`${this.apiBaseUrl}/api/users/${patientId}/locais-dor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          regiao_corpo: entry.regiao,
          tipo_registro: entry.tipo.toLowerCase(),
          intensidade: 5,
          observacao: entry.observacao || ''
        })
      }).catch(() => {});
    }

    return newEntry;
  },

  addRescueDoseRecord(patientId) {
    const nowStr = new Date().toLocaleString('pt-BR');
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const paciente = this.getPatientById(patientId);

    // Registra evolução
    this.addClinicalNote(patientId, {
      tipo: 'Dose de Resgate Administrada',
      conteudo: `Cuidador ou paciente confirmou a tomada de Dose de Resgate para dor aguda intensa as ${hora}.`,
      plano: 'Monitorar escala ESAS em 60 minutos para avaliar resposta analgesica.'
    });

    // Cria alerta com severidade moderada
    const alerta = {
      id: Date.now(),
      patientId: Number(patientId),
      pacienteNome: paciente ? `${paciente.identificador} (${paciente.nome})` : `Paciente ${patientId}`,
      prontuario: paciente ? paciente.prontuario : '---',
      titulo: `Dose de Resgate Tomada as ${hora}`,
      descricao: `Paciente registrou uso de dose de resgate para alivio de dor aguda intensa. Checar evolucao em 1 hora.`,
      data: nowStr,
      estado: 'Novo',
      severidade: 'moderada',
      motivo: 'Dose de resgate de analgésico administrada',
      revisadoPor: null,
      condutaRegistrada: null
    };
    if (!this.data.alertas) this.data.alertas = [];
    this.data.alertas.unshift(alerta);

    if (paciente) {
      paciente.ultimoRegistro = nowStr;
      paciente.estadoProposto = 'Novo';
    }

    this.saveToStorage();
    return alerta;
  },

  confirmMedicationDose(patientId, medId) {
    if (!this.data.medicamentos) return false;
    const med = this.data.medicamentos.find(m => m.id === Number(medId) && m.patientId === Number(patientId));
    if (!med) return false;

    const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const hojeStr = new Date().toLocaleDateString('pt-BR');
    med.aplicado = true;
    med.status = `Tomado às ${agora}`;
    med.dataAplicado = hojeStr;

    // Registra na evolução clínica e na linha do tempo para a equipe médica
    this.addClinicalNote(patientId, {
      tipo: 'Ingestão de Medicamento Confirmada',
      conteudo: `Paciente/cuidador confirmou no aplicativo a tomada de ${med.nome} às ${agora}.`,
      plano: 'Manter a farmacoterapia e o monitoramento posológico domiciliar.'
    });

    this.saveToStorage();
    window.dispatchEvent(new CustomEvent('zelo:data-changed', { detail: { type: 'medication_taken', medId, patientId } }));
    return med;
  },

  getPatientNotifications(patientId) {
    const patId = Number(patientId);
    const notifications = [];
    const hoje = new Date().toLocaleDateString('pt-BR');

    // 1. Avisos e Orientações da Equipe Médica
    const evolucoes = (this.data.evolucoes || []).filter(e => e.patientId === patId);
    evolucoes.forEach(ev => {
      notifications.push({
        id: `ev-${ev.id}`,
        tipo: 'equipe',
        prioridade: (ev.tipo && (ev.tipo.includes('Ajuste') || ev.tipo.includes('Alerta'))) ? 'alta' : 'normal',
        titulo: ev.tipo || 'Orientação da Equipe Assistencial',
        subtitulo: `${ev.autor || 'Equipe Zelo'} · ${ev.data}`,
        conteudo: ev.conteudo,
        conduta: ev.plano,
        data: ev.data,
        raw: ev
      });
    });

    // 2. Alertas Clínicos
    const alertas = (this.data.alertas || []).filter(a => a.patientId === patId);
    alertas.forEach(al => {
      let desc = al.descricao;
      if (al.estado === 'Em revisao') {
        desc = `Caso em análise pela equipe (${al.revisadoPor || 'Enfermagem'}). Conduta: ${al.condutaRegistrada || 'Em andamento'}.`;
      } else if (al.estado === 'Tratado') {
        desc = `Atendimento concluído pela equipe. Conduta: ${al.condutaRegistrada || 'Caso estabilizado e acompanhado'}.`;
      }
      notifications.push({
        id: `al-${al.id}`,
        tipo: 'alerta',
        prioridade: al.severidade === 'grave' ? 'urgente' : 'alta',
        titulo: al.titulo,
        subtitulo: `${al.data} · Status: ${al.estado}`,
        conteudo: desc,
        estado: al.estado,
        raw: al
      });
    });

    // 3. Lembretes de Remédios
    const meds = (this.data.medicamentos || []).filter(m => m.patientId === patId);
    meds.forEach(med => {
      notifications.push({
        id: `med-${med.id}`,
        tipo: 'medicamento',
        prioridade: med.ehResgate ? 'urgente' : 'normal',
        titulo: med.ehResgate ? `Dose de Resgate: ${med.nome}` : `Lembrete de Remédio: ${med.nome}`,
        subtitulo: med.aplicado ? `Confirmado Hoje` : `Horário Previsto: ${med.horario}`,
        conteudo: `Posologia: ${med.posologia}.${med.observacao ? ' ' + med.observacao : ''}`,
        aplicado: !!med.aplicado,
        ehResgate: !!med.ehResgate,
        medId: med.id,
        raw: med
      });
    });

    // 4. Lembrete de ESAS Diário
    const esasList = (this.data.esasHistory || []).filter(e => e.patientId === patId);
    const temEsasHoje = esasList.some(e => e.data && e.data.includes(hoje));
    if (!temEsasHoje) {
      notifications.unshift({
        id: 'esas-lembrete-hoje',
        tipo: 'esas_pendente',
        prioridade: 'alta',
        titulo: 'Lembrete: Registrar Sintomas de Hoje (ESAS)',
        subtitulo: 'Acompanhamento Diário Recomendado',
        conteudo: 'Você ainda não registrou seus sintomas hoje. O registro diário auxilia a equipe médica a controlar a dor e o mal-estar no domicílio.',
        link: 'sintomas-passos.html'
      });
    }

    return notifications;
  },

  resetToInitialDemo() {
    this.data = JSON.parse(JSON.stringify(this.initialData));
    this.saveToStorage();
  }
};

window.ZeloStore = ZeloStore;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ZeloStore.init());
} else {
  ZeloStore.init();
}
