/**
 * CONTROLADOR DO PORTAL ASSISTENCIAL (EQUIPE MEDICA E DE ENFERMAGEM)
 * Sistema Zelo - Cuidados Paliativos Oncologicos
 */

const AssistencialController = {
  activeTab: 'esas',
  currentPatientId: 1,

  initDashboard() {
    if (window.AuthService && !AuthService.requireAssistencialAccess()) return;
    this.updateTopbarUser();
    this.updateAlertBadges();
    this.renderMetrics();
    this.renderItemsLeitura();
    this.renderTimeline();
    this.renderPacientesTabela();

    window.addEventListener('zelo:data-changed', () => {
      this.updateAlertBadges();
      this.renderMetrics();
      this.renderItemsLeitura();
      this.renderTimeline();
      this.renderPacientesTabela();
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'zelo_system_db') {
        ZeloStore.loadFromStorage();
        this.updateAlertBadges();
        this.renderMetrics();
        this.renderItemsLeitura();
        this.renderTimeline();
        this.renderPacientesTabela();
      }
    });
  },

  updateAlertBadges() {
    const alertas = ZeloStore.getAlerts();
    const pendentes = alertas.filter(a => a.estado === 'Novo' || a.estado === 'Em revisao').length;

    // Atualiza todos os badges de alerta no sidebar e na interface
    document.querySelectorAll('#sidebar-badge-alertas, .sidebar-item a[href*="alertas"] .item-badge, .item-badge').forEach(badge => {
      badge.textContent = pendentes;
      badge.style.display = pendentes > 0 ? 'inline-block' : 'none';
    });

    const elItensLeitura = document.getElementById('kpi-itens-leitura');
    if (elItensLeitura) {
      elItensLeitura.textContent = pendentes;
    }
  },

  updateTopbarUser() {
    const raw = localStorage.getItem('zelo_session_user');
    if (!raw) return;
    try {
      const user = JSON.parse(raw);
      const userContainers = document.querySelectorAll('.topbar-user');
      userContainers.forEach(container => {
        const parts = user.nome.split(' ').filter(p => p.length > 2);
        const initials = parts.length >= 2 
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() 
          : user.nome.slice(0, 2).toUpperCase();

        const cargoDesc = user.cargo || (user.perfil === 'admin' ? 'Administrador Geral' : 'Equipe Assistencial');

        container.innerHTML = `
          <div class="user-avatar" title="${cargoDesc}">${initials}</div>
          <div>
            <strong>${user.nome}</strong><br>
            <span class="text-muted text-small">${cargoDesc}</span>
          </div>
          <button type="button" class="btn btn-secondary" style="margin-left: 12px; min-height: 32px; padding: 4px 10px; font-size: 0.8rem;" onclick="localStorage.removeItem('zelo_session_user'); location.href='../login.html';">
            Sair
          </button>
        `;
      });
    } catch (e) {
      // Ignora erro
    }
  },

  renderMetrics() {
    const pacientes = ZeloStore.getPatients();
    const alertas = ZeloStore.getAlerts();

    const totalPacientes = 24;
    const criticos = alertas.filter(a => a.severidade === 'grave' || a.estado === 'Novo').length || 2;
    const emAcompanhamento = alertas.filter(a => a.estado === 'Em revisao').length || 4;
    const controlados = Math.max(0, totalPacientes - criticos - emAcompanhamento);

    const elTotal = document.getElementById('kpi-total-pacientes');
    const elCriticos = document.getElementById('kpi-criticos');
    const elAcompanhamento = document.getElementById('kpi-em-acompanhamento');
    const elControlados = document.getElementById('kpi-sintomas-controlados');

    if (elTotal) elTotal.textContent = totalPacientes;
    if (elCriticos) elCriticos.textContent = criticos;
    if (elAcompanhamento) elAcompanhamento.textContent = emAcompanhamento;
    if (elControlados) elControlados.textContent = controlados;
  },

  renderItemsLeitura() {
    const container = document.getElementById('itens-leitura-container');
    if (!container) return;

    const alertas = ZeloStore.getAlerts().filter(a => a.estado === 'Novo' || a.estado === 'Em revisao');

    if (alertas.length === 0) {
      container.innerHTML = `
        <div class="alert-box alert-success" style="margin-bottom: 0;">
          <span>Todos os registros e respostas dos pacientes foram revisados pela equipe.</span>
        </div>
      `;
      return;
    }

    container.innerHTML = alertas.map(item => `
      <div class="item-leitura">
        <div class="item-leitura-info">
          <h4>${item.pacienteNome}</h4>
          <p class="item-leitura-desc">${item.titulo} &middot; ${item.data}</p>
          <div style="margin-top: 6px;">
            <span class="badge ${item.estado === 'Novo' ? 'badge-novo' : 'badge-revisao'}">
              ${item.estado} &middot; proposta
            </span>
            <span class="text-muted text-small" style="margin-left: 8px;">${item.motivo}</span>
          </div>
        </div>
        <div>
          <a href="paciente-detalhe.html?id=${item.patientId}" class="btn btn-secondary">
            Abrir detalhe
          </a>
        </div>
      </div>
    `).join('');
  },

  renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    const events = [];

    // 1. Histórico de avaliações ESAS (mais recentes primeiro)
    (ZeloStore.data.esasHistory || []).forEach(e => {
      const p = ZeloStore.getPatientById(e.patientId);
      const pName = p ? p.identificador : `Paciente ${e.patientId}`;
      const dor = e.sintomas?.dor ?? 0;
      events.push({
        data: e.data,
        timestamp: new Date(e.dataIso || Date.now()).getTime(),
        texto: `<strong>${pName}</strong> &middot; Registro ESAS diário recebido. Dor: ${dor}/10 (${dor >= 7 ? 'Severa - Gatilho de alerta emitido' : (dor >= 4 ? 'Moderada' : 'Leve')}).`
      });
    });

    // 2. Histórico de triagens do Chatbot Zelo
    (ZeloStore.data.triagemHistory || []).forEach(t => {
      const p = ZeloStore.getPatientById(t.patientId);
      const pName = p ? p.identificador : `Paciente ${t.patientId}`;
      events.push({
        data: t.data,
        timestamp: Date.now() - 600000,
        texto: `<strong>${pName}</strong> &middot; Triagem Chatbot Zelo concluída. Dor: ${t.intensidadeDor}/10 (${t.caracteristica || 'Triagem'}). ${t.solicitouAgendamento ? 'Agendamento solicitado pela família.' : ''}`
      });
    });

    // 3. Locais de dor mapeados
    (ZeloStore.data.locaisDor || []).forEach(l => {
      const p = ZeloStore.getPatientById(l.patientId);
      const pName = p ? p.identificador : `Paciente ${l.patientId}`;
      events.push({
        data: l.data,
        timestamp: Date.now() - 1200000,
        texto: `<strong>${pName}</strong> &middot; Esquema corporal atualizado: queixa de ${l.tipo} na região <em>${l.regiao}</em>.`
      });
    });

    // 4. Notas clínicas e doses de resgate
    (ZeloStore.data.evolucoes || []).forEach(ev => {
      const p = ZeloStore.getPatientById(ev.patientId);
      const pName = p ? p.identificador : `Paciente ${ev.patientId}`;
      events.push({
        data: ev.data,
        timestamp: Date.now() - 3600000,
        texto: `<strong>${pName}</strong> &middot; ${ev.tipo}: ${ev.conteudo ? ev.conteudo.slice(0, 110) + '...' : ''}`
      });
    });

    if (events.length === 0) {
      container.innerHTML = `<p class="text-muted text-small" style="padding: 12px;">Nenhum evento recente registrado.</p>`;
      return;
    }

    // Exibe os 5 eventos mais recentes
    const displayEvents = events.slice(0, 5);

    container.innerHTML = `
      <div class="timeline">
        ${displayEvents.map(ev => `
          <div class="timeline-item">
            <div class="timeline-date">${ev.data}</div>
            <div class="timeline-text">${ev.texto}</div>
          </div>
        `).join('')}
      </div>
    `;
  },

  renderPacientesTabela(elementId = 'tabela-pacientes-body', filterText = '', statusFilter = 'todos') {
    const tbody = document.getElementById(elementId);
    if (!tbody) return;

    let pacientes = ZeloStore.getPatients();

    if (filterText) {
      const q = filterText.toLowerCase();
      pacientes = pacientes.filter(p =>
        p.nome.toLowerCase().includes(q) ||
        p.identificador.toLowerCase().includes(q) ||
        p.prontuario.toLowerCase().includes(q) ||
        p.cuidador.toLowerCase().includes(q)
      );
    }

    if (statusFilter && statusFilter !== 'todos') {
      pacientes = pacientes.filter(p => p.estadoProposto.toLowerCase() === statusFilter.toLowerCase());
    }

    if (pacientes.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-muted" style="text-align: center; padding: 24px;">Nenhum paciente encontrado para os criterios selecionados.</td></tr>`;
      return;
    }

    tbody.innerHTML = pacientes.map(p => {
      let badgeClass = 'badge-novo';
      if (p.estadoProposto === 'Em revisao') badgeClass = 'badge-revisao';
      if (p.estadoProposto === 'Tratado') badgeClass = 'badge-tratado';
      if (p.estadoProposto === 'Sem registro') badgeClass = 'badge-novo';

      return `
        <tr>
          <td>
            <strong>${p.identificador}</strong><br>
            <span class="text-muted text-small">${p.nome} (Pront. ${p.prontuario})</span>
          </td>
          <td>${p.ultimoRegistro}</td>
          <td>
            <span class="badge ${badgeClass}">${p.estadoProposto}</span>
          </td>
          <td>
            <span style="font-weight: 600;">${p.sintomaCritico}</span><br>
            <span class="text-muted text-small">${p.diagnostico} &middot; PPS ${p.pps}%</span>
          </td>
          <td style="text-align: right;">
            <a href="paciente-detalhe.html?id=${p.id}" class="btn btn-secondary" style="min-height: 38px; padding: 6px 14px; font-size: 0.85rem;">
              Ver Prontuario ->
            </a>
          </td>
        </tr>
      `;
    }).join('');
  },

  initPacientesList() {
    if (window.AuthService && !AuthService.requireAssistencialAccess()) return;
    this.updateTopbarUser();
    this.renderPacientesTabela('tabela-pacientes-completa');

    const searchInput = document.getElementById('search-paciente');
    const statusSelect = document.getElementById('select-estado');

    const applyFilters = () => {
      const q = searchInput ? searchInput.value : '';
      const s = statusSelect ? statusSelect.value : 'todos';
      this.renderPacientesTabela('tabela-pacientes-completa', q, s);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusSelect) statusSelect.addEventListener('change', applyFilters);
  },

  initPatientDetail() {
    if (window.AuthService && !AuthService.requireAssistencialAccess()) return;
    this.updateTopbarUser();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || 1;
    this.currentPatientId = Number(id);

    const paciente = ZeloStore.getPatientById(this.currentPatientId);
    if (!paciente) {
      alert('Paciente nao encontrado.');
      window.location.href = 'pacientes.html';
      return;
    }

    document.getElementById('detalhe-id').textContent = paciente.identificador;
    document.getElementById('detalhe-nome').textContent = paciente.nome;
    document.getElementById('detalhe-prontuario').textContent = paciente.prontuario;
    document.getElementById('detalhe-cuidador').textContent = paciente.cuidador;
    document.getElementById('detalhe-pps').textContent = `${paciente.pps}%`;
    document.getElementById('detalhe-cid').textContent = paciente.diagnostico;
    document.getElementById('detalhe-ultimo-registro').textContent = paciente.ultimoRegistro;
    
    const badgeEl = document.getElementById('detalhe-badge-estado');
    if (badgeEl) {
      badgeEl.textContent = `${paciente.estadoProposto} &middot; estado proposto`;
      badgeEl.className = `badge ${paciente.estadoProposto === 'Novo' ? 'badge-novo' : (paciente.estadoProposto === 'Em revisao' ? 'badge-revisao' : 'badge-tratado')}`;
    }

    this.renderESASTab();
    this.renderTriageTab();
    this.renderMedicationsTab();
    this.renderEvolucoesTab();
    this.renderInfoTab(paciente);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const tabTarget = btn.dataset.tab;
        document.getElementById(`tab-${tabTarget}`)?.classList.add('active');
      });
    });

    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab) {
      const targetBtn = document.querySelector(`.tab-btn[data-tab="${initialTab}"]`);
      if (targetBtn) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        targetBtn.classList.add('active');
        document.getElementById(`tab-${initialTab}`)?.classList.add('active');
      }
    }
  },

  renderESASTab() {
    const esasList = ZeloStore.getESASHistory(this.currentPatientId);
    if (esasList.length === 0) return;

    const latest = esasList[0];
    const s = latest.sintomas;

    const getScoreClass = (val) => {
      if (val <= 1) return 'esas-score-0-1';
      if (val <= 3) return 'esas-score-2-3';
      if (val === 4) return 'esas-score-4';
      if (val <= 6) return 'esas-score-5-6';
      return 'esas-score-7-10';
    };

    const container = document.getElementById('esas-metrics-list');
    if (container) {
      const rows = [
        { label: 'Dor', val: s.dor },
        { label: 'Cansaco / Fadiga', val: s.cansaco },
        { label: 'Nausea', val: s.nausea },
        { label: 'Depressao', val: s.depressao },
        { label: 'Ansiedade', val: s.ansiedade },
        { label: 'Sonolencia', val: s.sonolencia },
        { label: 'Apetite (Falta de apetite)', val: s.apetite },
        { label: 'Mal-estar global', val: s.mal_estar },
        { label: 'Falta de ar / Dispneia', val: s.falta_de_ar },
        { label: 'Constipacao intestinal', val: s.constipacao || 0 }
      ];

      container.innerHTML = rows.map(r => `
        <div class="esas-metric-row">
          <span><strong>${r.label}</strong></span>
          <span class="esas-score-badge ${getScoreClass(r.val)}">${r.val}/10</span>
        </div>
      `).join('');
    }

    const chartContainer = document.getElementById('chart-dor-container');
    if (chartContainer && esasList.length >= 3) {
      const val1 = esasList[2].sintomas.dor;
      const val2 = esasList[1].sintomas.dor;
      const val3 = esasList[0].sintomas.dor;

      chartContainer.innerHTML = `
        <div class="simple-bar-chart" aria-label="Grafico de evolucao da dor de 0 a 10 nos dias 07, 08 e 09 de outubro de 2026">
          <div class="bar-column">
            <span class="bar-val">${val1}</span>
            <div class="bar-fill" style="height: ${(val1 / 10) * 100}%;"></div>
            <span class="bar-label">07/10</span>
          </div>
          <div class="bar-column">
            <span class="bar-val">${val2}</span>
            <div class="bar-fill" style="height: ${(val2 / 10) * 100}%;"></div>
            <span class="bar-label">08/10</span>
          </div>
          <div class="bar-column">
            <span class="bar-val" style="color: var(--zelo-danger); font-size: 1.3rem;">${val3}</span>
            <div class="bar-fill" style="height: ${(val3 / 10) * 100}%; background-color: var(--zelo-danger);"></div>
            <span class="bar-label" style="font-weight: 800;">09/10 (Hoje)</span>
          </div>
        </div>
        <p class="text-small text-muted" style="margin-top: 8px;">
          <strong>Equivalente textual acessivel:</strong> Dor avaliada em 3/10 em 07/10; 5/10 em 08/10; 8/10 em 09/10 (exacerbacao com acionamento do fluxo conversacional Zelo).
        </p>
      `;
    }
  },

  renderTriageTab() {
    const triagens = ZeloStore.getPainTriageHistory(this.currentPatientId);
    const container = document.getElementById('tab-triage-content');
    if (!container) return;

    if (triagens.length === 0) {
      container.innerHTML = `
        <div class="alert-box alert-info">
          <span>O paciente nao possui sessao de triagem da dor registrada recentemente (acionada com dor ESAS >= 7).</span>
        </div>
      `;
      return;
    }

    const t = triagens[0];
    container.innerHTML = `
      <div class="triage-report-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; border-bottom: 2px solid var(--zelo-border); padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 1.35rem; color: var(--zelo-primary);">Relatorio Clinico da Triagem Chatbot Zelo</h3>
            <span class="text-muted text-small">Sessao registrada em ${t.data} &middot; Baseada no Script Validado por Especialistas (IVC = 0,95)</span>
          </div>
          <span class="badge badge-grave" style="font-size: 0.9rem; padding: 6px 14px;">
            Dor Informada: ${t.intensidadeDor}/10
          </span>
        </div>

        <div class="script-item">
          <div class="script-meta">1. Caracteristica Semiologica da Dor (IVCs: Somatica 1.00, Neuropatica 0.95, Visceral 0.91)</div>
          <div class="script-question">"Dentre as opcoes, qual descreve como e a sua dor?"</div>
          <div class="script-answer">${t.caracteristica}</div>
        </div>

        <div class="script-item">
          <div class="script-meta">2. Duracao e Cronologia (IVC = 0,91)</div>
          <div class="script-question">"Sua dor comecou ha mais de 02 semanas?"</div>
          <div class="script-answer">${t.duracao}</div>
        </div>

        <div class="script-item">
          <div class="script-meta">3. Avaliacao Farmacologica e Dose de Resgate (IVC = 0,90)</div>
          <div class="script-question">"O senhor (a) ja fez uso de dose de resgate para essa dor?"</div>
          <div class="script-answer">${t.doseResgate}</div>
        </div>

        <div class="script-item">
          <div class="script-meta">4. Efetividade Terapeutica dos Medicamentos (IVC = 0,95)</div>
          <div class="script-question">"Os medicamentos que o senhor (a) faz uso estao sendo efetivos na maior parte do seu dia?"</div>
          <div class="script-answer">${t.medicamentosEfetivos}</div>
        </div>

        <div class="script-item">
          <div class="script-meta">5. Sintomas Acompanhantes e Fatores Agravantes (IVC = 1,00 e 0,90)</div>
          <div class="script-question">"Ha algum outro sintoma que acompanha a dor ou fatores que a pioram?"</div>
          <div class="script-answer">
            Associados: ${t.sintomasAssociados}<br>
            Piora: ${t.fatoresPiora}
          </div>
        </div>

        <div class="script-item">
          <div class="script-meta">6. Desfecho e Encaminhamento Assistencial</div>
          <div class="script-question">"Deseja agendar uma consulta com nossa equipe especializada?"</div>
          <div class="script-answer" style="background-color: var(--zelo-danger-bg); color: var(--zelo-danger); font-weight: 700;">
            ${t.solicitouAgendamento ? 'SIM &middot; Paciente solicitou contato / consulta da equipe especializada' : 'NAO &middot; Apenas orientacoes domiciliares'}
          </div>
        </div>

        <div class="alert-box alert-success" style="margin-top: 24px;">
          <div>
            <strong>Medidas Nao Farmacologicas Transmitidas ao Domicilio:</strong>
            <ul style="margin-top: 8px; padding-left: 20px;">
              ${t.medidasNaoFarmacologicas.map(m => `<li>${m}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  renderMedicationsTab() {
    const meds = ZeloStore.getMedications(this.currentPatientId);
    const container = document.getElementById('tab-meds-content');
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 12px;">
        <div>
          <h3 style="margin-bottom: 4px;">Receituario & Farmacoterapia (RENAME)</h3>
          <p class="text-muted text-small">Medicamentos ativos, posologia programada e doses de resgate (SOS)</p>
        </div>
        <button type="button" class="btn btn-primary" onclick="AssistencialController.openNovaPrescricaoModal()">
          + Prescrever Medicamento
        </button>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Relacao de Medicamentos Prescritos</h3>
          <span class="text-muted text-small">${meds.length} itens ativos</span>
        </div>
        <div class="table-container">
          <table class="zelo-table">
            <thead>
              <tr>
                <th>Medicamento & Dose</th>
                <th>Horarios / Frequencia</th>
                <th>Finalidade</th>
                <th>Status Atual</th>
                <th>Medico Prescritor</th>
              </tr>
            </thead>
            <tbody>
              ${meds.length === 0 ? `
                <tr><td colspan="5" class="text-muted" style="text-align: center; padding: 24px;">Nenhum medicamento prescrito registrado no momento.</td></tr>
              ` : meds.map(m => `
                <tr>
                  <td>
                    <strong>${m.nome}</strong><br>
                    <span class="text-muted text-small">${m.posologia}</span>
                    ${m.ehResgate ? '<span class="badge badge-grave" style="margin-left: 6px;">Dose de Resgate</span>' : ''}
                    ${m.observacao ? `<div style="font-size: 0.8rem; color: var(--zelo-text-muted); margin-top: 4px;">Obs: ${m.observacao}</div>` : ''}
                  </td>
                  <td>${m.horario}</td>
                  <td>${m.ehResgate ? 'Analgesia aguda se dor intensa (SOS)' : 'Uso continuo programado'}</td>
                  <td>
                    <span class="badge ${m.aplicado ? 'badge-tratado' : 'badge-revisao'}">
                      ${m.status}
                    </span>
                  </td>
                  <td class="text-small">
                    ${m.medico}<br>
                    <span class="text-muted" style="font-size: 0.75rem;">Validade: ${m.vigencia || '30 dias'}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  },

  renderEvolucoesTab() {
    const evolucoes = ZeloStore.getClinicalNotes(this.currentPatientId);
    const container = document.getElementById('tab-evolucoes-list');
    if (!container) return;

    container.innerHTML = evolucoes.map(ev => `
      <div class="card" style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
          <div>
            <h4 style="color: var(--zelo-primary);">${ev.tipo}</h4>
            <span class="text-muted text-small">${ev.autor} (${ev.cargo}) &middot; ${ev.data}</span>
          </div>
        </div>
        <p style="font-size: 1rem; line-height: 1.6; margin-bottom: 12px;">${ev.conteudo}</p>
        <div style="background-color: var(--zelo-surface-soft); padding: 12px; border-radius: var(--radius-md);">
          <strong>Conduta e Plano Avancado de Cuidados:</strong> ${ev.plano}
        </div>
      </div>
    `).join('');
  },

  renderInfoTab(paciente) {
    const container = document.getElementById('tab-info-content');
    if (!container) return;

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
        <div class="card">
          <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--zelo-border); padding-bottom: 8px;">Dados Pessoais & Rede de Apoio</h3>
          <p><strong>Nome Completo:</strong> ${paciente.nome}</p>
          <p><strong>Numero de Prontuario:</strong> ${paciente.prontuario}</p>
          <p><strong>Idade / Sexo:</strong> ${paciente.idade} anos &middot; ${paciente.sexo}</p>
          <p><strong>CPF:</strong> ${paciente.cpf}</p>
          <p><strong>Telefone / Celular:</strong> ${paciente.telefone}</p>
          <p><strong>Cuidador Principal:</strong> ${paciente.cuidador}</p>
          <p><strong>Parentesco:</strong> ${paciente.parentesco} (Conforme achado de 70,97% cuidadores familiares na pesquisa de base)</p>
        </div>

        <div class="card">
          <h3 style="margin-bottom: 16px; border-bottom: 1px solid var(--zelo-border); padding-bottom: 8px;">Dados Clinicos & Cuidados Paliativos</h3>
          <p><strong>Diagnostico Oncologico:</strong> ${paciente.diagnostico}</p>
          <p><strong>Indice PPS:</strong> <span class="badge badge-novo">${paciente.pps}% (Performance Paliativa)</span></p>
          <p><strong>Modalidade de Tratamento:</strong> ${paciente.tratamento}</p>
          <p><strong>Comorbidades Secundarias:</strong> ${paciente.comorbidades}</p>
          <p><strong>Alergias Medicamentosas:</strong> ${paciente.alergias}</p>
          <p><strong>Proxima Consulta Agendada:</strong> ${paciente.proximaConsulta}</p>
        </div>
      </div>
    `;
  },

  openNovaEvolucaoModal() {
    let modal = document.getElementById('modal-nova-evolucao');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-nova-evolucao';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 650px;" role="dialog" aria-modal="true" aria-labelledby="modal-ev-title">
          <h3 id="modal-ev-title">Registrar Evolucao Clinica</h3>
          <p>Adicione um registro assistencial multiprofissional ao prontuario do paciente:</p>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 700; margin-bottom: 6px;">Tipo de Atendimento:</label>
            <select id="input-ev-tipo" class="select-filter" style="width: 100%;">
              <option value="Telemonitoramento de Enfermagem (Resolucao Cofen 634/2020)">Telemonitoramento de Enfermagem</option>
              <option value="Parecer Medico de Cuidados Paliativos">Parecer Medico de Cuidados Paliativos</option>
              <option value="Atendimento Domiciliar Multiprofissional">Atendimento Domiciliar Multiprofissional</option>
              <option value="Reavaliacao de Sintoma Agudo">Reavaliacao de Sintoma Agudo</option>
            </select>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: block; font-weight: 700; margin-bottom: 6px;">Descricao da Evolucao Clinica:</label>
            <textarea id="input-ev-texto" rows="4" class="search-input" style="width: 100%; resize: vertical;" placeholder="Relate as queixas, estado geral, orientacoes repassadas e dialogo com cuidador..."></textarea>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 700; margin-bottom: 6px;">Conduta e Plano Avancado de Cuidado (PAC):</label>
            <input type="text" id="input-ev-plano" class="search-input" style="width: 100%;" placeholder="Ex: Manter dose de resgate prescrita; retorno telefonico em 4h.">
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-nova-evolucao').classList.remove('active')">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-salvar-evolucao">Salvar no Prontuario</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      document.getElementById('btn-salvar-evolucao')?.addEventListener('click', () => {
        const texto = document.getElementById('input-ev-texto').value;
        const plano = document.getElementById('input-ev-plano').value;
        const tipo = document.getElementById('input-ev-tipo').value;

        if (!texto.trim()) {
          alert('Por favor, descreva a evolucao clinica.');
          return;
        }

        ZeloStore.addClinicalNote(this.currentPatientId, {
          tipo,
          conteudo: texto.trim(),
          plano: plano.trim() || 'Acompanhamento domiciliar mantido.'
        });

        modal.classList.remove('active');
        document.getElementById('input-ev-texto').value = '';
        this.renderEvolucoesTab();
        alert('Evolucao clinica registrada com sucesso no prontuario!');
      });
    }

    modal.classList.add('active');
  },

  openNovaPrescricaoModal() {
    let modal = document.getElementById('modal-nova-prescricao');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-nova-prescricao';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog" style="max-width: 680px;" role="dialog" aria-modal="true" aria-labelledby="modal-rx-title">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 id="modal-rx-title" style="margin: 0; color: var(--zelo-primary);">Prescrever Medicamento (Receituario Medico)</h3>
            <span class="badge badge-novo">Padrao RENAME / Cuidados Paliativos</span>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 14px; max-height: 70vh; overflow-y: auto; padding-right: 6px;">
            <div>
              <label for="rx-select-preset" style="display: block; font-weight: 700; margin-bottom: 4px;">Fármacos Prevalentes em Cuidados Paliativos (RENAME):</label>
              <select id="rx-select-preset" class="search-input" style="width: 100%;">
                <option value="">-- Selecione ou digite manualmente abaixo --</option>
                <option value="Morfina 10mg comprimido|1 comprimido via oral|A cada 4 horas se dor intensa|true|Opioide forte para resgate agudo|Administrar se escore dor >= 7. Se nao aliviar em 60 min, contatar equipe.">Morfina 10mg comprimido (Dose de Resgate / Opioide Forte)</option>
                <option value="Morfina Solucao Oral 10mg/mL|10 gotas (5mg) diluidas em agua|A cada 4 horas SOS|true|Opioide forte liquido|Uso exclusivo se crise de dor. Nao ultrapassar 4 doses em 24h.">Morfina Solução Oral 10mg/mL (Gotas / Resgate Rápido)</option>
                <option value="Codeina 30mg comprimido|1 comprimido via oral|08:00, 14:00, 20:00, 02:00 (a cada 6h)|false|Opioide fraco analgesia de base|Uso fixo de horario. Tomar sempre com agua apos as refeicoes.">Codeína 30mg comprimido (Analgesia Basal Regular)</option>
                <option value="Paracetamol 500mg comprimido|1 comprimido via oral|A cada 6 horas se dor leve/moderada|false|Analgesico simples nao opioide|Intervalo minimo de 6h entre as tomadas.">Paracetamol 500mg (Analgésico Simples / Dor Leve)</option>
                <option value="Gabapentina 300mg capsula|1 capsula a noite|20:00 (a noite)|false|Adjuvante para dor neuropatica|Pode causar sonolencia inicial. Nao interromper de forma abrupta.">Gabapentina 300mg (Adjuvante / Dor Neuropática em queimação)</option>
                <option value="Lactulose 667mg/mL xarope|15 mL via oral|08:00 e 20:00 (12/12h)|false|Laxativo profilatico obrigatorio para opioides|Manter ingesta de liquidos associada.">Lactulose 667mg/mL (Laxativo Profilático para Opioides)</option>
                <option value="Metoclopramida 10mg comprimido|1 comprimido via oral|30 min antes das principais refeicoes|false|Antiemetico profilatico|Tomar se enjoo ou plenitude gastrica.">Metoclopramida 10mg (Antiemético / Náuseas)</option>
                <option value="Dexametasona 4mg comprimido|1 comprimido pela manha|08:00 (com o cafe)|false|Corticoide adjuvante anti-inflamatorio|Tomar sempre pela manha com alimentos.">Dexametasona 4mg (Corticoide Adjuvante)</option>
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label for="rx-input-nome" style="display: block; font-weight: 700; margin-bottom: 4px;">Nome e Concentracao:</label>
                <input type="text" id="rx-input-nome" class="search-input" placeholder="Ex: Morfina 10mg comprimido" style="width: 100%;">
              </div>
              <div>
                <label for="rx-input-posologia" style="display: block; font-weight: 700; margin-bottom: 4px;">Dose e Via de Administracao:</label>
                <input type="text" id="rx-input-posologia" class="search-input" placeholder="Ex: 1 comprimido via oral" style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <label for="rx-input-horario" style="display: block; font-weight: 700; margin-bottom: 4px;">Horarios / Intervalo:</label>
                <input type="text" id="rx-input-horario" class="search-input" placeholder="Ex: 08:00, 14:00, 20:00, 02:00 ou SOS" style="width: 100%;">
              </div>
              <div>
                <label for="rx-input-finalidade" style="display: block; font-weight: 700; margin-bottom: 4px;">Finalidade Clinica:</label>
                <input type="text" id="rx-input-finalidade" class="search-input" placeholder="Ex: Analgesia basal / Dor neuropatica" style="width: 100%;">
              </div>
            </div>

            <div class="card" style="background-color: var(--zelo-primary-light); border-color: var(--zelo-primary); padding: 12px; margin: 0;">
              <label style="display: flex; align-items: center; gap: 10px; cursor: pointer; margin: 0; font-weight: 700; color: var(--zelo-primary);">
                <input type="checkbox" id="rx-check-resgate" style="width: 20px; height: 20px; accent-color: var(--zelo-danger);">
                <span>Medicamento de Resgate para Dor Aguda Severa (SOS)</span>
              </label>
              <p class="text-small text-muted" style="margin-top: 4px; margin-bottom: 0;">
                Se marcado, este medicamento sera destacado no aplicativo do paciente e acionado pelo Chatbot Zelo caso o escore ESAS de dor seja >= 7.
              </p>
            </div>

            <div>
              <label for="rx-input-observacao" style="display: block; font-weight: 700; margin-bottom: 4px;">Orientacoes para o Cuidador Familiar (Linguagem Clara):</label>
              <textarea id="rx-input-observacao" class="search-input" rows="3" style="width: 100%; resize: vertical;" placeholder="Ex: Administrar com agua apos as refeicoes. Se a dor nao diminuir em 60 min, notificar o plantao."></textarea>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;">
              <div>
                <label for="rx-input-medico" style="display: block; font-weight: 700; margin-bottom: 4px;">Medico Prescritor / CRM:</label>
                <input type="text" id="rx-input-medico" class="search-input" value="Dr. Alexandre Prado (CRM/PR 24890)" style="width: 100%;">
              </div>
              <div>
                <label for="rx-input-vigencia" style="display: block; font-weight: 700; margin-bottom: 4px;">Validade da Receita:</label>
                <input type="text" id="rx-input-vigencia" class="search-input" value="30 dias" style="width: 100%;">
              </div>
            </div>
          </div>

          <div class="modal-actions" style="margin-top: 18px;">
            <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-nova-prescricao').classList.remove('active')">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-salvar-prescricao">Salvar e Emitir Prescricao</button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Evento de preenchimento automático a partir do preset RENAME
      document.getElementById('rx-select-preset')?.addEventListener('change', (e) => {
        const val = e.target.value;
        if (!val) return;
        const [nome, posologia, horario, ehResgate, finalidade, obs] = val.split('|');
        document.getElementById('rx-input-nome').value = nome || '';
        document.getElementById('rx-input-posologia').value = posologia || '';
        document.getElementById('rx-input-horario').value = horario || '';
        document.getElementById('rx-check-resgate').checked = (ehResgate === 'true');
        document.getElementById('rx-input-finalidade').value = finalidade || '';
        document.getElementById('rx-input-observacao').value = obs || '';
      });

      // Evento de submissão da prescrição
      document.getElementById('btn-salvar-prescricao')?.addEventListener('click', () => {
        const nome = document.getElementById('rx-input-nome').value.trim();
        const posologia = document.getElementById('rx-input-posologia').value.trim();
        const horario = document.getElementById('rx-input-horario').value.trim();
        const ehResgate = document.getElementById('rx-check-resgate').checked;
        const obs = document.getElementById('rx-input-observacao').value.trim();
        const medico = document.getElementById('rx-input-medico').value.trim();
        const vigencia = document.getElementById('rx-input-vigencia').value.trim();

        if (!nome || !posologia || !horario) {
          alert('Por favor, preencha os campos obrigatorios: Nome do Medicamento, Dose/Posologia e Horarios.');
          return;
        }

        ZeloStore.addMedication(this.currentPatientId, {
          nome,
          posologia,
          horario,
          ehResgate,
          observacao: obs,
          medico: medico || 'Medico Assistencial',
          vigencia: vigencia || '30 dias',
          status: 'Ativo / Programado'
        });

        // Registra automaticamente uma anotação na evolução clínica para auditoria médica
        ZeloStore.addClinicalNote(this.currentPatientId, {
          tipo: 'Ajuste de Prescrição Médica',
          conteudo: `Prescrito medicamento: ${nome} - ${posologia} (${horario}). Finalidade: ${ehResgate ? 'Dose de Resgate SOS' : 'Analgesia/Cuidado Basal'}. Obs: ${obs || 'Sem observacoes adicionais'}.`,
          plano: 'Monitorar resposta terapeutica e controle da dor na escala ESAS.'
        });

        modal.classList.remove('active');
        this.renderMedicationsTab();
        alert('Prescricao medica registrada com sucesso! A nova medicacao ja esta disponivel no aplicativo do paciente e cuidador.');
      });
    }

    modal.classList.add('active');
  },

  currentAlertFilter: 'todos',

  initAlertas() {
    if (window.AuthService && !AuthService.requireAssistencialAccess()) return;
    this.updateTopbarUser();
    this.updateAlertBadges();
    this.updateAlertFilterCounts();
    this.renderAlertasList(this.currentAlertFilter || 'todos');

    document.querySelectorAll('.alert-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.alert-filter-btn').forEach(b => {
          b.classList.remove('active');
          b.classList.remove('btn-primary');
          b.classList.add('btn-secondary');
        });
        btn.classList.add('active');
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');
        this.currentAlertFilter = btn.dataset.status;
        this.renderAlertasList(btn.dataset.status);
      });
    });

    window.addEventListener('zelo:data-changed', () => {
      this.updateAlertBadges();
      this.updateAlertFilterCounts();
      this.renderAlertasList(this.currentAlertFilter || 'todos');
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'zelo_system_db') {
        ZeloStore.loadFromStorage();
        this.updateAlertBadges();
        this.updateAlertFilterCounts();
        this.renderAlertasList(this.currentAlertFilter || 'todos');
      }
    });
  },

  updateAlertFilterCounts() {
    const all = ZeloStore.getAlerts('todos') || [];
    const countTodos = all.length;
    const countNovo = all.filter(a => a.estado === 'Novo').length;
    const countRevisao = all.filter(a => a.estado === 'Em revisao').length;
    const countTratado = all.filter(a => a.estado === 'Tratado').length;

    const btnTodos = document.querySelector('.alert-filter-btn[data-status="todos"]');
    const btnNovo = document.querySelector('.alert-filter-btn[data-status="Novo"]');
    const btnRevisao = document.querySelector('.alert-filter-btn[data-status="Em revisao"]');
    const btnTratado = document.querySelector('.alert-filter-btn[data-status="Tratado"]');

    if (btnTodos) btnTodos.innerHTML = `Todos &middot; <strong>${countTodos}</strong>`;
    if (btnNovo) btnNovo.innerHTML = `Novo &middot; <strong>${countNovo}</strong>`;
    if (btnRevisao) btnRevisao.innerHTML = `Em revisao &middot; <strong>${countRevisao}</strong>`;
    if (btnTratado) btnTratado.innerHTML = `Tratado &middot; <strong>${countTratado}</strong>`;
  },

  renderAlertasList(statusFilter = 'todos') {
    const container = document.getElementById('alertas-list-container');
    if (!container) return;

    this.currentAlertFilter = statusFilter;
    const alertas = ZeloStore.getAlerts(statusFilter);

    if (alertas.length === 0) {
      container.innerHTML = `
        <div class="alert-box alert-success" style="padding: 24px; border-radius: 12px; margin-top: 10px;">
          <h4 style="margin: 0 0 6px 0; color: var(--zelo-primary);">Nenhum alerta pendente para o filtro "${statusFilter.toUpperCase()}"</h4>
          <p class="text-muted" style="margin: 0;">Todos os chamados neste status foram devidamente auditados ou ainda não há novos registros.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = alertas.map(a => `
      <div class="card" style="margin-bottom: 16px; border-left: 5px solid ${a.estado === 'Novo' ? 'var(--zelo-danger)' : (a.estado === 'Em revisao' ? 'var(--zelo-warning)' : 'var(--zelo-success)')}; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; flex-wrap: wrap; margin-bottom: 10px;">
          <div>
            <span class="badge ${a.estado === 'Novo' ? 'badge-novo' : (a.estado === 'Em revisao' ? 'badge-revisao' : 'badge-tratado')}">
              ${a.estado}
            </span>
            <span class="text-muted text-small" style="margin-left: 8px;">${a.data}</span>
            <h3 style="margin-top: 6px; font-size: 1.25rem;">${a.titulo}</h3>
            <span class="text-muted" style="font-weight: 600;">${a.pacienteNome} (Pront. ${a.prontuario})</span>
          </div>

          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${a.estado === 'Novo' ? `
              <button type="button" class="btn btn-secondary" onclick="AssistencialController.transitarAlerta(${a.id}, 'Em revisao')" title="Iniciar revisão pela equipe">
                Simular Em revisao -&gt;
              </button>
              <button type="button" class="btn btn-primary" onclick="AssistencialController.transitarAlerta(${a.id}, 'Tratado')" title="Concluir e registrar conduta">
                ✓ Concluir e Tratar
              </button>
            ` : ''}
            ${a.estado === 'Em revisao' ? `
              <button type="button" class="btn btn-primary" onclick="AssistencialController.transitarAlerta(${a.id}, 'Tratado')" title="Concluir e registrar conduta">
                ✓ Concluir e Marcar como Tratado
              </button>
            ` : ''}
            ${a.estado === 'Tratado' ? `
              <button type="button" class="btn btn-secondary" onclick="AssistencialController.transitarAlerta(${a.id}, 'Novo')" title="Reabrir alerta para revisão">
                ↺ Reabrir Alerta
              </button>
            ` : ''}
            <a href="paciente-detalhe.html?id=${a.patientId}" class="btn btn-secondary">
              Ver Prontuario
            </a>
          </div>
        </div>

        <p style="font-size: 1rem; line-height: 1.5; color: var(--zelo-text); margin-bottom: 12px;">
          ${a.descricao}
        </p>

        ${a.revisadoPor ? `
          <div style="background-color: var(--zelo-surface-soft); border: 1px solid var(--zelo-border); padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.9rem;">
            <strong>Trilha de Auditoria (COFEN 634/2020):</strong> Revisado por <em>${a.revisadoPor}</em><br>
            ${a.condutaRegistrada ? `<strong>Conduta:</strong> ${a.condutaRegistrada}` : ''}
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  transitarAlerta(alertaId, novoEstado) {
    const alerta = ZeloStore.getAlertById(alertaId);
    if (!alerta) return;

    const profissional = (ZeloStore.data.currentUser && ZeloStore.data.currentUser.nome) || 'Enf. Bruna Tres (COREN-PR 330719)';
    let conduta = null;

    if (novoEstado === 'Em revisao') {
      conduta = prompt('Observacao inicial de contato com o paciente/cuidador:', 'Entrado em contato com familiar. Sintoma sob acompanhamento da equipe.');
      if (conduta === null) return;
    } else if (novoEstado === 'Tratado') {
      conduta = prompt('Conduta clinica final para encerramento do alerta:', 'Dose de alivio e medidas de conforto surtiram efeito. Sintoma estabilizado no domicilio.');
      if (conduta === null) return;
    } else if (novoEstado === 'Novo') {
      conduta = 'Alerta reaberto para acompanhamento ativo.';
    }

    ZeloStore.updateAlertStatus(alertaId, novoEstado, profissional, conduta);
    this.updateAlertBadges();
    this.updateAlertFilterCounts();
    this.renderAlertasList(this.currentAlertFilter || 'todos');
  },

  openNovoPacienteModal() {
    let modal = document.getElementById('modal-novo-paciente');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-novo-paciente';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="novo-pac-title" style="max-width: 600px;">
          <h3 id="novo-pac-title" style="color: var(--zelo-primary); margin-bottom: 12px;">Cadastrar Novo Paciente Paliativo</h3>
          <p class="text-small text-muted" style="margin-bottom: 16px;">
            Insira os dados clínicos do paciente para vinculá-lo à coorte de acompanhamento domiciliar e sincronizar com o banco de dados.
          </p>
          <form id="form-novo-paciente" onsubmit="event.preventDefault(); AssistencialController.salvarNovoPaciente();">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Nome Completo do Paciente *</label>
                <input type="text" id="novo-pac-nome" class="search-input" required placeholder="Ex: Alzira Pereira dos Santos" style="width: 100%;">
              </div>
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Prontuário *</label>
                <input type="text" id="novo-pac-prontuario" class="search-input" required placeholder="Ex: 005" style="width: 100%;">
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Idade *</label>
                <input type="number" id="novo-pac-idade" class="search-input" required placeholder="Ex: 78" style="width: 100%;">
              </div>
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Sexo *</label>
                <select id="novo-pac-sexo" class="select-filter" style="width: 100%;">
                  <option value="Feminino">Feminino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Escore PPS Inicial *</label>
                <select id="novo-pac-pps" class="select-filter" style="width: 100%;">
                  <option value="70">PPS 70% (Autonomia moderada)</option>
                  <option value="60">PPS 60% (Requer auxílio)</option>
                  <option value="50">PPS 50% (Sentado grande parte)</option>
                  <option value="40">PPS 40% (Restrito ao leito)</option>
                  <option value="30">PPS 30% (Acamado total)</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Cuidador Principal *</label>
                <input type="text" id="novo-pac-cuidador" class="search-input" required placeholder="Ex: Marcos Santos (Filho)" style="width: 100%;">
              </div>
              <div>
                <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Telefone de Contato *</label>
                <input type="text" id="novo-pac-telefone" class="search-input" required placeholder="Ex: (41) 99888-1122" style="width: 100%;">
              </div>
            </div>

            <div style="margin-bottom: 12px;">
              <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Diagnóstico Oncológico Principal (CID-10) *</label>
              <input type="text" id="novo-pac-diagnostico" class="search-input" required placeholder="Ex: Neoplasia Maligna de Mama (CID-10 C50)" style="width: 100%;">
            </div>

            <div style="margin-bottom: 16px;">
              <label style="display: block; font-weight: 700; font-size: 0.85rem; margin-bottom: 4px;">Alergias Medicamentosas Conhecidas</label>
              <input type="text" id="novo-pac-alergias" class="search-input" placeholder="Ex: Dipirona, Iodo (ou Nenhuma informada)" style="width: 100%;">
            </div>

            <div class="modal-actions" style="display: flex; gap: 10px; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="document.getElementById('modal-novo-paciente').classList.remove('active')">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary">
                Salvar e Vincular Paciente
              </button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  },

  salvarNovoPaciente() {
    const nome = document.getElementById('novo-pac-nome').value.trim();
    const prontuario = document.getElementById('novo-pac-prontuario').value.trim();
    const idade = document.getElementById('novo-pac-idade').value.trim();
    const sexo = document.getElementById('novo-pac-sexo').value;
    const pps = document.getElementById('novo-pac-pps').value;
    const cuidador = document.getElementById('novo-pac-cuidador').value.trim();
    const telefone = document.getElementById('novo-pac-telefone').value.trim();
    const diagnostico = document.getElementById('novo-pac-diagnostico').value.trim();
    const alergias = document.getElementById('novo-pac-alergias').value.trim();

    if (!nome || !prontuario) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    const novo = ZeloStore.addPatient({
      nome,
      prontuario,
      idade,
      sexo,
      pps,
      cuidador,
      telefone,
      diagnostico,
      alergias
    });

    document.getElementById('modal-novo-paciente')?.classList.remove('active');
    document.getElementById('form-novo-paciente')?.reset();
    
    alert(`Paciente ${novo.nome} (${novo.identificador}) cadastrado com sucesso!`);
    
    if (typeof this.renderPacientesTabela === 'function') {
      this.renderPacientesTabela('tabela-pacientes-completa');
      this.renderPacientesTabela('tabela-pacientes-body');
    }
    if (typeof this.renderMetrics === 'function') {
      this.renderMetrics();
    }
  },

  initAcompanhamento() {
    if (window.AuthService && !AuthService.requireAssistencialAccess()) return;
    this.updateAlertBadges();
    this.setupRealtimeSync();

    const select = document.getElementById('select-context-patient');
    if (!select) return;

    // Preenche opções de pacientes dinamicamente
    const pacientes = ZeloStore.getPatients();
    select.innerHTML = pacientes.map(p => `
      <option value="${p.id}">${p.identificador} (${p.nome})</option>
    `).join('');

    const urlParams = new URLSearchParams(window.location.search);
    const initialId = Number(urlParams.get('id') || select.value || 1);
    select.value = initialId;

    const updateContextView = (patId) => {
      const p = ZeloStore.getPatientById(patId);
      if (!p) return;

      // Link do prontuário
      const linkPront = document.getElementById('context-link-prontuario');
      if (linkPront) linkPront.href = `paciente-detalhe.html?id=${p.id}`;

      // Badge de estado
      const badgeEstado = document.getElementById('context-badge-estado');
      if (badgeEstado) {
        badgeEstado.className = `badge ${p.estadoProposto === 'Novo' ? 'badge-novo' : (p.estadoProposto === 'Em revisao' ? 'badge-revisao' : 'badge-tratado')}`;
        badgeEstado.textContent = `${p.estadoProposto} · estado proposto`;
      }

      // Último registro
      const ultReg = document.getElementById('context-ultimo-registro');
      if (ultReg) {
        ultReg.textContent = `${p.ultimoRegistro} (${p.sintomaCritico || 'Estável'})`;
      }

      // Contatos
      const contatosTexto = document.getElementById('context-contatos-texto');
      if (contatosTexto) {
        contatosTexto.innerHTML = `
          <strong>Cuidador Familiar:</strong> ${p.cuidador}<br>
          <strong>Telefone:</strong> ${p.telefone}<br>
          <strong>Regiao:</strong> Curitiba e Regiao Metropolitana
        `;
      }
      const btnTel = document.getElementById('context-btn-tel');
      if (btnTel) {
        btnTel.href = `tel:${p.telefone.replace(/\D/g, '')}`;
      }

      // Destinatário
      const destEl = document.getElementById('context-destinatario');
      if (destEl) {
        destEl.innerHTML = `<strong>Destinatario:</strong> ${p.cuidador} (Cuidador de ${p.nome})`;
      }

      // Timeline
      this.renderAcompanhamentoTimeline(p.id);
    };

    select.addEventListener('change', (e) => {
      updateContextView(Number(e.target.value));
    });

    updateContextView(initialId);

    // Botão Enviar Orientação
    const btnEnviar = document.getElementById('btn-enviar-orientacao');
    if (btnEnviar) {
      btnEnviar.addEventListener('click', () => {
        const patId = Number(select.value);
        const p = ZeloStore.getPatientById(patId);
        const textarea = document.getElementById('textarea-rascunho');
        const msg = textarea ? textarea.value.trim() : '';

        if (!msg) {
          alert('Por favor, escreva a mensagem de orientação antes de enviar.');
          return;
        }

        // Adiciona à evolução clínica e transmite ao paciente
        ZeloStore.addClinicalNote(patId, {
          tipo: 'Orientação de Enfermagem / Médica',
          conteudo: msg,
          plano: 'Orientação encaminhada diretamente ao aplicativo do paciente e cuidador.'
        });

        // Atualiza status do paciente
        if (p && p.estadoProposto === 'Novo') {
          ZeloStore.updatePatientStatus(patId, 'Em revisao');
        }

        alert(`Orientação clínica transmitida com sucesso para o aplicativo de ${p.nome} / ${p.cuidador}!`);
        textarea.value = '';
        updateContextView(patId);
      });
    }
  },

  renderAcompanhamentoTimeline(patientId) {
    const timeline = document.getElementById('acompanhamento-timeline');
    if (!timeline) return;

    const patId = Number(patientId);
    const events = [];

    // 1. Evoluções
    const evolucoes = ZeloStore.getClinicalNotes(patId);
    evolucoes.forEach(e => {
      events.push({
        data: e.data,
        titulo: `${e.tipo || 'Evolução'} · ${e.autor || 'Equipe Zelo'}`,
        texto: `${e.conteudo} ${e.plano ? '— Plano: ' + e.plano : ''}`
      });
    });

    // 2. ESAS
    const esas = ZeloStore.getESASHistory(patId);
    esas.forEach(es => {
      events.push({
        data: es.data,
        titulo: 'Registro ESAS Realizado no Domicílio',
        texto: `Dor: ${es.sintomas.dor}/10, Cansaço: ${es.sintomas.cansaco}/10, Mal-estar: ${es.sintomas.mal_estar || 3}/10. ${es.acionouTriagem ? 'Acionou triagem prioritária.' : 'Sem queixas agudas.'}`
      });
    });

    // 3. Triagens
    const triagens = ZeloStore.getPainTriageHistory(patId);
    triagens.forEach(tr => {
      events.push({
        data: tr.data,
        titulo: 'Triagem da Dor (Chatbot Zelo)',
        texto: `Intensidade: ${tr.intensidadeDor}/10 (${tr.caracteristica}). Resgate: ${tr.doseResgate}. ${tr.solicitouAgendamento ? 'Solicitou retorno/agendamento.' : ''}`
      });
    });

    if (events.length === 0) {
      timeline.innerHTML = '<p class="text-muted text-small" style="padding: 12px 0;">Nenhum evento registrado para este paciente ainda.</p>';
      return;
    }

    timeline.innerHTML = events.slice(0, 10).map(ev => `
      <div class="timeline-item">
        <div class="timeline-date">${ev.data} &middot; ${ev.titulo}</div>
        <div class="timeline-text">${ev.texto}</div>
      </div>
    `).join('');
  }
};

window.AssistencialController = AssistencialController;
