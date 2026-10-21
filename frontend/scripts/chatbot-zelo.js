/**
 * MOTOR DO CHATBOT ZELO - TRIAGEM DA DOR EM CUIDADOS PALIATIVOS
 * 
 * Implementacao fiel do SCRIPT CLINICO AVALIADO E VALIDADO POR JUIZES ESPECIALISTAS
 * da pesquisa de base de mestrado (Grzybowski, 2023).
 * 
 * Indices de Validade de Conteudo (IVC medio = 0,95):
 * - Dor Somatica: IVC = 1,00
 * - Dor Neuropatica: IVC = 0,95
 * - Dor Visceral: IVC = 0,91
 * - Inicio ha mais de 2 semanas (tipo aguda/cronica): IVC = 0,91
 * - Outro sintoma que acompanha a dor: IVC = 1,00
 * - Fator que aumente ou piora a dor: IVC = 0,90
 * - Medicamentos efetivos na maior parte do dia: IVC = 0,95
 * - Em acompanhamento com a equipe: IVC = 0,95
 * - Uso de dose de resgate/extra: IVC = 0,90
 */

class ChatbotZeloController {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.options = options;
    this.patientId = options.patientId || 1;
    this.patientName = options.patientName || 'Leovegildo Coimbra Nunes';
    this.intensidadeDor = options.intensidadeDor || 8;
    this.step = 0;
    this.answers = {
      intensidadeDor: this.intensidadeDor,
      caracteristica: null,
      duracao: null,
      doseResgate: null,
      medicamentosEfetivos: null,
      sintomasAssociados: null,
      fatoresPiora: null,
      acompanhamento: null,
      solicitouAgendamento: null
    };

    if (this.container) {
      this.init();
    }
  }

  init() {
    this.container.innerHTML = `
      <div class="chat-window" id="chat-stream" role="log" aria-live="polite">
        <!-- Banner de Emergencia e Sinais de Alarme (Texto Obrigatorio Validado) -->
        <div class="chat-alert-banner" role="alert">
          <h3>
            <span style="font-weight: 800; text-transform: uppercase;">[Aviso Importante]</span> Sinais de Alerta e Emergencia Medica
          </h3>
          <p>
            Caso a senhora ou o senhor tenha tido uma <strong>queda, fratura</strong>, apresente <strong>lesoes bolhosas na pele</strong> ou <strong>perda de movimentos e sensibilidade das pernas e pes</strong>. Se seu familiar esta com <strong>muito sono (sonolencia profunda) apos ingerir a morfina</strong>: <em>Procure o pronto atendimento especializado o mais breve possivel.</em>
          </p>
        </div>
      </div>
      <div id="chat-controls" class="chat-controls-area"></div>
    `;

    this.stream = document.getElementById('chat-stream');
    this.controls = document.getElementById('chat-controls');

    setTimeout(() => this.stepWelcome(), 400);
  }

  addZeloMessage(text, extraHtml = '') {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble-zelo';
    bubble.innerHTML = `
      <div style="font-size: 0.8rem; font-weight: 700; color: var(--zelo-primary); margin-bottom: 4px;">
        Zelo &middot; Assistente em Cuidados Paliativos
      </div>
      <div>${text}</div>
      ${extraHtml}
    `;
    this.stream.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  addUserMessage(text) {
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble-user';
    bubble.innerHTML = `<div>${text}</div>`;
    this.stream.appendChild(bubble);
    bubble.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }

  stepWelcome() {
    this.addZeloMessage(
      `Ola, ${this.patientName}. Voce informou <strong>DOR em intensidade ${this.intensidadeDor}</strong> (na escala ESAS de 0 a 10).`,
      `<p style="margin-top: 8px; font-size: 0.95rem; color: var(--zelo-text-muted);">
        Vamos fazer algumas perguntas rapidas para entender melhor sua dor e direcionar os cuidados adequados no seu domicilio.
      </p>`
    );

    setTimeout(() => this.stepCharacteristics(), 600);
  }

  stepCharacteristics() {
    this.addZeloMessage('Dentre as opcoes abaixo, qual descreve melhor como e a sua dor?');

    this.controls.innerHTML = `
      <div class="chat-options-group" role="group" aria-label="Escolha a caracteristica da dor">
        <button type="button" class="chat-option-btn" data-type="somatica">
          <strong>Somatica:</strong> Parecida com sensacao de pontada, aperto ou facada.
          <span style="font-size: 0.75rem; display: block; opacity: 0.8; margin-top: 2px;">(Validacao Especialistas: IVC = 1,00)</span>
        </button>
        <button type="button" class="chat-option-btn" data-type="neuropatica">
          <strong>Neuropatica:</strong> Bem localizada, com formigamento, choque ou queimacao.
          <span style="font-size: 0.75rem; display: block; opacity: 0.8; margin-top: 2px;">(Validacao Especialistas: IVC = 0,95)</span>
        </button>
        <button type="button" class="chat-option-btn" data-type="visceral">
          <strong>Visceral:</strong> Difusa, sem localizacao exata ou sensacao de colica intestinal.
          <span style="font-size: 0.75rem; display: block; opacity: 0.8; margin-top: 2px;">(Validacao Especialistas: IVC = 0,91)</span>
        </button>
        <button type="button" class="chat-option-btn" data-type="nenhuma" style="border-color: var(--zelo-border);">
          Nenhuma das opcoes acima
        </button>
      </div>
    `;

    setTimeout(() => {
      this.controls.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);

    this.controls.querySelectorAll('.chat-option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        let label = 'Nenhuma das opcoes';
        if (type === 'somatica') label = 'Somatica: Sensacao de pontada, aperto ou facada';
        if (type === 'neuropatica') label = 'Neuropatica: Sensacao de choque, queimacao ou formigamento';
        if (type === 'visceral') label = 'Visceral: Dor difusa ou sensacao de colica intestinal';

        this.answers.caracteristica = label;
        this.addUserMessage(label);
        this.controls.innerHTML = '';
        setTimeout(() => this.stepDuration(), 500);
      });
    });
  }

  stepDuration() {
    this.addZeloMessage(
      'Sua dor comecou ha mais de 02 semanas?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Pergunta validada por juizes: IVC = 0,91)</span>`
    );

    this.renderBinaryButtons('Sim, comecou ha mais de 2 semanas', 'Nao, comecou recentemente', (choice) => {
      this.answers.duracao = choice ? 'Cronica (mais de 2 semanas)' : 'Aguda (inicio recente)';
      this.addUserMessage(choice ? 'Sim, comecou ha mais de 2 semanas' : 'Nao, comecou recentemente');
      setTimeout(() => this.stepRescueDose(), 500);
    });
  }

  stepRescueDose() {
    this.addZeloMessage(
      'O senhor (a) ja fez uso da <strong>dose de resgate</strong> (dose extra prescrita pelo medico) para essa dor?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Validacao por juizes especialistas: IVC = 0,90)</span>`
    );

    this.renderBinaryButtons('Sim, ja tomei o resgate', 'Nao tomei a dose de resgate', (choice) => {
      this.answers.doseResgate = choice ? 'Sim, fez uso de dose de resgate' : 'Nao fez uso de dose de resgate';
      this.addUserMessage(choice ? 'Sim, ja tomei o resgate' : 'Nao tomei a dose de resgate');
      setTimeout(() => this.stepMedsEffective(), 500);
    });
  }

  stepMedsEffective() {
    this.addZeloMessage(
      'Os medicamentos que o senhor (a) faz uso estao sendo efetivos na maior parte do seu dia?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Validacao por juizes especialistas: IVC = 0,95)</span>`
    );

    this.renderBinaryButtons('Sim, sao efetivos', 'Nao estao sendo efetivos', (choice) => {
      this.answers.medicamentosEfetivos = choice ? 'Sim, efetivos na maior parte' : 'Nao estao controlando adequadamente';
      this.addUserMessage(choice ? 'Sim, sao efetivos' : 'Nao estao sendo efetivos');
      setTimeout(() => this.stepAccompanyingSymptoms(), 500);
    });
  }

  stepAccompanyingSymptoms() {
    this.addZeloMessage(
      'Ha algum outro sintoma que acompanha a dor neste momento (como nausea, falta de ar ou agitacao)?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Validacao por juizes especialistas: IVC = 1,00)</span>`
    );

    this.renderBinaryButtons('Sim, sinto outro sintoma', 'Nao, apenas a dor', (choice) => {
      this.answers.sintomasAssociados = choice ? 'Sim, apresenta sintomas associados' : 'Nao apresenta outros sintomas';
      this.addUserMessage(choice ? 'Sim, sinto outro sintoma' : 'Nao, apenas a dor');
      setTimeout(() => this.stepWorseningFactors(), 500);
    });
  }

  stepWorseningFactors() {
    this.addZeloMessage(
      'Existe ou percebeu algum fator que o senhor (a) note que aumente ou piora a sua dor (como esforco fisico, tosse ou posicao)?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Validacao por juizes especialistas: IVC = 0,90)</span>`
    );

    this.renderBinaryButtons('Sim, percebi fatores de piora', 'Nao percebi fatores de piora', (choice) => {
      this.answers.fatoresPiora = choice ? 'Sim, relata fatores de piora' : 'Nao identificou fatores';
      this.addUserMessage(choice ? 'Sim, percebi fatores de piora' : 'Nao percebi fatores de piora');
      setTimeout(() => this.stepFollowUpStatus(), 500);
    });
  }

  stepFollowUpStatus() {
    this.addZeloMessage(
      'O senhor (a) ja esta em acompanhamento com a nossa equipe especializada para o controle desse sintoma?',
      `<span style="font-size: 0.75rem; color: var(--zelo-text-muted);">(Validacao por juizes especialistas: IVC = 0,95)</span>`
    );

    this.renderBinaryButtons('Sim, ja estou em acompanhamento', 'Nao, e a primeira ocorrencia', (choice) => {
      this.answers.acompanhamento = choice ? 'Sim, paciente em acompanhamento' : 'Nao, primeira queixa';
      this.addUserMessage(choice ? 'Sim, ja estou em acompanhamento' : 'Nao, e a primeira ocorrencia');
      setTimeout(() => this.stepCareDirectives(), 600);
    });
  }

  stepCareDirectives() {
    this.addZeloMessage(
      'Vou listar algumas medidas nao farmacologicas que podem auxiliar no conforto e alivio da dor ate a reavaliacao:',
      `
      <div class="care-directives-box" role="region" aria-label="Orientacoes de conforto de enfermagem">
        <h4>Orientacoes de Conforto e Autocuidado Domiciliar:</h4>
        <ul>
          <li><strong>Ambiente e Posicionamento:</strong> Procure manter o ambiente calmo, com pouca luminosidade e o paciente em posicao confortavel (use travesseiros sob as pernas ou decubito lateral).</li>
          <li><strong>Respiracao e Relaxamento:</strong> Pratique respiracoes lentas e suaves junto com o familiar para diminuir a tensao muscular.</li>
          <li><strong>Tecnicas de Distracao:</strong> Utilize formas agradaveis de distracao (musica suave, televisao, leitura ou conversa acolhedora).</li>
          <li><strong>Terapias Complementares:</strong> Auriculoterapia, acupuntura e massagem de conforto por profissional qualificado.</li>
          <li><strong>Apoio Emocional:</strong> Cuidador familiar deve transmitir tranquilidade e seguranca.</li>
        </ul>
      </div>
      `
    );

    setTimeout(() => this.stepAskAppointment(), 800);
  }

  stepAskAppointment() {
    this.addZeloMessage(
      'Deseja agendar uma consulta com nossa equipe especializada ou solicitar retorno telefonico prioritario?',
      `<span style="font-size: 0.85rem; color: var(--zelo-text-muted);">Essa solicitacao aparecera imediatamente na Central de Alertas da Equipe de Saude.</span>`
    );

    this.renderBinaryButtons('Sim, desejo agendar consulta', 'Nao, vou aguardar', (choice) => {
      this.answers.solicitouAgendamento = choice;
      this.addUserMessage(choice ? 'Sim, desejo agendar consulta' : 'Nao, vou aguardar');
      setTimeout(() => this.stepConclusion(choice), 600);
    });
  }

  stepConclusion(solicitouAgendamento) {
    if (window.ZeloStore) {
      ZeloStore.savePainTriageSession(this.patientId, {
        intensidadeDor: this.intensidadeDor,
        caracteristica: this.answers.caracteristica,
        duracao: this.answers.duracao,
        doseResgate: this.answers.doseResgate,
        medicamentosEfetivos: this.answers.medicamentosEfetivos,
        acompanhamento: this.answers.acompanhamento,
        sintomasAssociados: this.answers.sintomasAssociados,
        fatoresPiora: this.answers.fatoresPiora,
        medidasNaoFarmacologicas: [
          'Ambiente calmo e posicionamento com travesseiros',
          'Tecnicas de respiracao e relaxamento',
          'Distracao audiovisual suave e apoio do familiar cuidador'
        ],
        solicitouAgendamento: solicitouAgendamento,
        desfecho: solicitouAgendamento
          ? 'Consulta solicitada pelo paciente. Alerta prioritario disparado para a equipe medica e de enfermagem.'
          : 'Orientacoes domiciliares repassadas. Monitoramento preventivo ativo.'
      });
    }

    if (solicitouAgendamento) {
      this.addZeloMessage(
        'Solicitacao confirmada!',
        `
        <div class="alert-box alert-success" style="margin-top: 10px;">
          <div>
            <strong>Alerta Prioritario Gerado na Equipe de Saude:</strong><br>
            Nossa equipe especializada recebeu suas respostas e o pedido de consulta. Entraremos em contato com voce ou com seu cuidador familiar pelo telefone cadastrado em breve.
          </div>
        </div>
        <p style="margin-top: 10px;">Se houver piora subita ou sinais de alarme, ligue imediatamente para a central de urgencia:</p>
        <div style="display: flex; gap: 12px; margin-top: 14px; flex-direction: column; width: 100%;">
          <a href="tel:4130000000" class="btn btn-primary btn-elderly" style="width: 100%; text-align: center;">
            Ligar para a Central: (41) 3000-0000
          </a>
          <button type="button" class="btn btn-secondary btn-elderly" onclick="location.href='index.html'" style="width: 100%;">
            Voltar ao Inicio
          </button>
        </div>
        `
      );
    } else {
      this.addZeloMessage(
        'Orientacoes registradas com sucesso!',
        `
        <p style="margin-top: 8px;">
          Caso sinta qualquer mudanca nos sintomas ou precise de apoio, nossa equipe permanece a disposicao para cuidar de voce e de sua familia.
        </p>
        <div style="display: flex; gap: 12px; margin-top: 14px; flex-direction: column; width: 100%;">
          <a href="tel:4130000000" class="btn btn-secondary btn-elderly" style="width: 100%; text-align: center;">
            Central de Apoio: (41) 3000-0000
          </a>
          <button type="button" class="btn btn-primary btn-elderly" onclick="location.href='index.html'" style="width: 100%;">
            Concluir e Voltar
          </button>
        </div>
        `
      );
    }

    this.controls.innerHTML = '';
  }

  renderBinaryButtons(labelYes, labelNo, callback) {
    this.controls.innerHTML = `
      <div class="chat-binary-group" role="group">
        <button type="button" class="btn btn-primary btn-elderly" id="btn-chat-yes" style="width: 100%;">
          ${labelYes}
        </button>
        <button type="button" class="btn btn-secondary btn-elderly" id="btn-chat-no" style="width: 100%;">
          ${labelNo}
        </button>
      </div>
    `;

    setTimeout(() => {
      this.controls.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);

    document.getElementById('btn-chat-yes').addEventListener('click', () => {
      this.controls.innerHTML = '';
      callback(true);
    });

    document.getElementById('btn-chat-no').addEventListener('click', () => {
      this.controls.innerHTML = '';
      callback(false);
    });
  }
}

window.ChatbotZeloController = ChatbotZeloController;
