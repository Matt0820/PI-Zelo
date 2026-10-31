// Definição Canônica dos 10 Sintomas da Escala ESAS + Constipação Intestinal (WCAG 2.2 & Validação Clínica)
if (typeof window !== 'undefined' && typeof window.ESAS_SYMPTOMS === 'undefined') {
  window.ESAS_SYMPTOMS = [
    { id: 'dor', nome: 'Dor', minDesc: '0 · Sem dor', maxDesc: '10 · Pior dor possível', question: 'Indique na escala o número que melhor descreve a intensidade da sua dor neste momento:' },
    { id: 'cansaco', nome: 'Cansaço / Fadiga', minDesc: '0 · Sem cansaço', maxDesc: '10 · Pior cansaço possível', question: 'Como está o seu nível de cansaço ou fraqueza física agora?' },
    { id: 'nausea', nome: 'Náusea / Enjoo', minDesc: '0 · Sem náusea', maxDesc: '10 · Pior náusea (enjoo)', question: 'Você está sentindo enjoo ou vontade de vomitar hoje?' },
    { id: 'depressao', nome: 'Tristeza / Depressão', minDesc: '0 · Sem tristeza', maxDesc: '10 · Pior tristeza possível', question: 'Como o senhor (a) avalia o sentimento de tristeza ou desânimo hoje?' },
    { id: 'ansiedade', nome: 'Ansiedade / Agitação', minDesc: '0 · Sem ansiedade', maxDesc: '10 · Pior ansiedade possível', question: 'Como você sente seu estado de calma ou ansiedade neste momento?' },
    { id: 'sonolencia', nome: 'Sonolência', minDesc: '0 · Sem sono excessivo', maxDesc: '10 · Pior sonolência', question: 'Como avalia a vontade de dormir ou sonolência durante o dia?' },
    { id: 'apetite', nome: 'Falta de Apetite', minDesc: '0 · Bom apetite', maxDesc: '10 · Pior falta de apetite', question: 'Como foi a alimentação e a vontade de comer nas últimas refeições?' },
    { id: 'mal_estar', nome: 'Sensação de Mal-Estar', minDesc: '0 · Bem-estar pleno', maxDesc: '10 · Pior mal-estar', question: 'De maneira geral, como o senhor (a) sente o seu corpo hoje?' },
    { id: 'falta_de_ar', nome: 'Falta de Ar / Dispneia', minDesc: '0 · Sem falta de ar', maxDesc: '10 · Pior falta de ar', question: 'Você tem sentido cansaço ao respirar ou falta de ar no repouso?' },
    { id: 'constipacao', nome: 'Intestino Preso / Constipação', minDesc: '0 · Hábito normal', maxDesc: '10 · Pior constipação possível', question: 'Como avalia a dificuldade ou prisão de ventre para evacuar nas últimas 24h?' }
  ];
}

/**
 * MODULO DE ACESSIBILIDADE GLOBAL (WCAG 2.2 AA/AAA & IHC PARA IDOSOS)
 * Sistema Zelo - Cuidados Paliativos Oncologicos
 */

const ZeloA11y = {
  state: {
    fontSize: 'normal', // 'normal', 'large', 'xlarge'
    highContrast: false,
    darkMode: false,
    colorScheme: 'system',
    reducedMotion: false,
  },

  init() {
    this.ensureHighContrastStyles();
    this.ensureA11yContainer();
    this.loadPreferences();
    this.applyPreferences();
    this.renderA11yBar();
    this.bindKeyboardShortcuts();
    this.bindPreferenceSync();
    this.updateUI();
  },

  ensureHighContrastStyles() {
    if (document.querySelector('[data-zelo-high-contrast-styles]')) return;

    const accessibilityScript = document.querySelector('script[src$="/scripts/acessibilidade.js"]');
    if (!accessibilityScript) {
      console.error('Não foi possível localizar acessibilidade.js para carregar os estilos de alto contraste.');
      return;
    }

    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = new URL('../styles/high-contrast.css?v=7', accessibilityScript.src).href;
    stylesheet.dataset.zeloHighContrastStyles = '';
    document.head.appendChild(stylesheet);
  },

  ensureA11yContainer() {
    if (document.getElementById('a11y-container')) return;

    const container = document.createElement('div');
    container.id = 'a11y-container';
    document.body.insertBefore(container, document.body.firstChild);
  },

  loadPreferences() {
    try {
      const shared = localStorage.getItem('@zelo/web/accessibility');
      if (shared) {
        const preferences = JSON.parse(shared);
        if (['normal', 'large', 'xlarge'].includes(preferences.fontSize)) this.state.fontSize = preferences.fontSize;
        if (['system', 'light', 'dark'].includes(preferences.colorScheme)) this.state.colorScheme = preferences.colorScheme;
        this.state.highContrast = Boolean(preferences.highContrast);
      } else {
        const saved = localStorage.getItem('zelo_a11y_prefs');
        if (saved) {
          this.state = { ...this.state, ...JSON.parse(saved) };
          this.state.colorScheme = this.state.darkMode ? 'dark' : 'system';
        } else {
          const oldVisual = localStorage.getItem('@zelo/web/visual');
          if (oldVisual === 'escuro') this.state.colorScheme = 'dark';
          if (oldVisual === 'claro') this.state.colorScheme = 'light';
          if (oldVisual === 'alto-contraste') this.state.highContrast = true;
        }
      }
      // Suporte a parametros de URL para testes e acesso direto
      const params = new URLSearchParams(window.location.search);
      if (params.get('contrast') === 'high' || params.get('highContrast') === 'true') {
        this.state.highContrast = true;
      }
      if (['normal', 'large', 'xlarge'].includes(params.get('fontSize'))) {
        this.state.fontSize = params.get('fontSize');
      }
    } catch (e) {
      console.warn('Erro ao carregar preferencias de acessibilidade:', e);
    }
  },

  savePreferences() {
    try {
      localStorage.setItem('zelo_a11y_prefs', JSON.stringify(this.state));
      localStorage.setItem('@zelo/web/accessibility', JSON.stringify({
        fontSize: this.state.fontSize,
        colorScheme: this.state.colorScheme,
        highContrast: this.state.highContrast,
      }));
    } catch (e) {
      console.warn('Erro ao salvar preferencias de acessibilidade:', e);
    }
  },

  applyPreferences() {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

    if (this.state.colorScheme === 'system') {
      this.state.darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      this.state.darkMode = this.state.colorScheme === 'dark';
    }
    root.dataset.theme = this.state.darkMode ? 'dark' : 'light';
    root.dataset.fontScale = this.state.fontSize;

    // Escala de fontes na raiz e no body
    root.classList.remove('font-large', 'font-xlarge');
    body.classList.remove('font-large', 'font-xlarge');

    if (this.state.fontSize === 'large') {
      root.classList.add('font-large');
      body.classList.add('font-large');
      root.style.fontSize = '19px';
    } else if (this.state.fontSize === 'xlarge') {
      root.classList.add('font-xlarge');
      body.classList.add('font-xlarge');
      root.style.fontSize = '22px';
    } else {
      root.style.fontSize = '16px';
    }

    // Modo Alto Contraste (Fundo escuro #000000 e tipografia amarela #FFFF00)
    if (this.state.highContrast) {
      root.classList.add('high-contrast');
      body.classList.add('high-contrast');
      root.setAttribute('data-contrast', 'high');
    } else {
      root.classList.remove('high-contrast');
      body.classList.remove('high-contrast');
      root.removeAttribute('data-contrast');
    }

    // Modo Noturno
    if (this.state.darkMode && !this.state.highContrast) {
      root.classList.add('dark-mode');
      body.classList.add('dark-mode');
    } else {
      root.classList.remove('dark-mode');
      body.classList.remove('dark-mode');
    }

    // Movimento reduzido
    if (this.state.reducedMotion) {
      root.classList.add('reduced-motion');
      body.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
      body.classList.remove('reduced-motion');
    }

    this.updateUI();
  },

  setFontSize(size) {
    if (['normal', 'large', 'xlarge'].includes(size)) {
      this.state.fontSize = size;
      this.applyPreferences();
      this.savePreferences();
      const labels = { normal: 'Padrao (16px)', large: 'Grande (19px)', xlarge: 'Muito Grande (22px)' };
      this.announceToScreenReader(`Tamanho de texto alterado para: ${labels[size]}`);
    }
  },

  toggleFontSize() {
    if (this.state.fontSize === 'normal') this.state.fontSize = 'large';
    else if (this.state.fontSize === 'large') this.state.fontSize = 'xlarge';
    else this.state.fontSize = 'normal';

    this.applyPreferences();
    this.savePreferences();
    const labels = { normal: 'Padrao', large: 'Grande (+18%)', xlarge: 'Muito Grande (+37%)' };
    this.announceToScreenReader(`Tamanho de texto: ${labels[this.state.fontSize]}`);
  },

  toggleContrast() {
    this.state.highContrast = !this.state.highContrast;
    if (this.state.highContrast) this.state.darkMode = false;
    this.applyPreferences();
    this.savePreferences();
    this.announceToScreenReader(this.state.highContrast ? 'Alto contraste ativado' : 'Contraste padrao');
  },

  setContrast(enable) {
    this.state.highContrast = !!enable;
    if (this.state.highContrast) this.state.darkMode = false;
    this.applyPreferences();
    this.savePreferences();
    this.announceToScreenReader(this.state.highContrast ? 'Alto contraste ativado' : 'Contraste padrao');
  },

  toggleDarkMode() {
    this.state.colorScheme = this.state.darkMode ? 'light' : 'dark';
    this.state.darkMode = this.state.colorScheme === 'dark';
    if (this.state.darkMode) this.state.highContrast = false;
    this.applyPreferences();
    this.savePreferences();
    this.announceToScreenReader(this.state.darkMode ? 'Modo noturno ativado' : 'Modo diurno ativado');
  },

  toggleReducedMotion() {
    this.state.reducedMotion = !this.state.reducedMotion;
    this.applyPreferences();
    this.savePreferences();
    this.announceToScreenReader(this.state.reducedMotion ? 'Reducao de movimento ativada' : 'Animacoes normais');
  },

  bindPreferenceSync() {
    if (this.preferenceSyncBound) return;
    this.preferenceSyncBound = true;
    window.addEventListener('storage', event => {
      if (event.key !== '@zelo/web/accessibility') return;
      this.loadPreferences();
      this.applyPreferences();
      this.updateUI();
    });
    const colorPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => {
      if (this.state.colorScheme === 'system') this.applyPreferences();
    };
    if (colorPreference.addEventListener) colorPreference.addEventListener('change', updateSystemTheme);
    else colorPreference.addListener(updateSystemTheme);
  },

  updateUI() {
    // Atualiza botoes de tamanho de texto na tela de perfil/configuracoes
    const btnNormal = document.getElementById('btn-font-normal');
    const btnLarge = document.getElementById('btn-font-large');
    const btnXlarge = document.getElementById('btn-font-xlarge');

    if (btnNormal && btnLarge && btnXlarge) {
      [btnNormal, btnLarge, btnXlarge].forEach(b => {
        b.classList.remove('btn-primary', 'active');
        b.classList.add('btn-secondary');
        b.style.fontWeight = 'normal';
      });

      let activeBtn = btnNormal;
      if (this.state.fontSize === 'large') activeBtn = btnLarge;
      if (this.state.fontSize === 'xlarge') activeBtn = btnXlarge;

      activeBtn.classList.remove('btn-secondary');
      activeBtn.classList.add('btn-primary', 'active');
      activeBtn.style.fontWeight = '800';
    }

    // Atualiza botao e badge de alto contraste na tela de configuracoes
    const contrastBadge = document.getElementById('contrast-status-badge');
    const contrastBtn = document.getElementById('btn-contrast-toggle');
    if (contrastBadge) {
      if (this.state.highContrast) {
        contrastBadge.textContent = 'Ativado (Fundo Preto e Amarelo)';
        contrastBadge.className = 'badge badge-warning';
        contrastBadge.style.backgroundColor = '#FFFF00';
        contrastBadge.style.color = '#000000';
        contrastBadge.style.fontWeight = '800';
      } else {
        contrastBadge.textContent = 'Desativado';
        contrastBadge.className = 'badge badge-neutral';
        contrastBadge.style.backgroundColor = 'var(--zelo-surface-soft)';
        contrastBadge.style.color = 'var(--zelo-text-muted)';
        contrastBadge.style.fontWeight = '600';
      }
    }
    if (contrastBtn) {
      contrastBtn.textContent = this.state.highContrast ? 'Desativar Alto Contraste' : 'Ativar Alto Contraste';
      if (this.state.highContrast) {
        contrastBtn.classList.add('btn-primary');
        contrastBtn.classList.remove('btn-secondary');
      } else {
        contrastBtn.classList.remove('btn-primary');
        contrastBtn.classList.add('btn-secondary');
      }
    }

    // Atualiza indicador na barra superior se existir
    const barFont = document.getElementById('btn-a11y-font');
    if (barFont) {
      const tag = this.state.fontSize === 'xlarge' ? 'A++' : this.state.fontSize === 'large' ? 'A+' : 'A';
      barFont.textContent = `[${tag}] Texto`;
    }

    const barContrast = document.getElementById('btn-a11y-contrast');
    if (barContrast) {
      barContrast.textContent = this.state.highContrast ? 'Contraste: ON' : 'Contraste';
      barContrast.setAttribute('aria-pressed', String(this.state.highContrast));
    }

    const patientContrast = document.getElementById('btn-patient-a11y-contrast');
    if (patientContrast) {
      patientContrast.textContent = this.state.highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste';
      patientContrast.setAttribute('aria-pressed', String(this.state.highContrast));
    }

    if (contrastBtn) contrastBtn.setAttribute('aria-pressed', String(this.state.highContrast));
  },

  announceToScreenReader(message) {
    let liveRegion = document.getElementById('zelo-live-region');
    if (!liveRegion) {
      liveRegion = document.createElement('div');
      liveRegion.id = 'zelo-live-region';
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.style.position = 'absolute';
      liveRegion.style.left = '-9999px';
      liveRegion.style.width = '1px';
      liveRegion.style.height = '1px';
      liveRegion.style.overflow = 'hidden';
      document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
  },

  bindKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        this.toggleFontSize();
      }
      if (e.altKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        this.toggleContrast();
      }
    });
  },

  renderA11yBar() {
    const container = document.getElementById('a11y-container');
    if (!container) return;

    if (window.location.pathname.includes('/paciente/')) {
      container.innerHTML = `
        <aside class="patient-a11y-bar" aria-label="Ferramentas de acessibilidade">
          <button type="button" class="patient-a11y-toggle" id="btn-patient-a11y-contrast"
            onclick="AcessibilidadeController.toggleContrast()"
            title="Alternar alto contraste (Alt+C)"
            aria-label="Alternar alto contraste"
            aria-pressed="${this.state.highContrast}">
            ${this.state.highContrast ? 'Desativar alto contraste' : 'Ativar alto contraste'}
          </button>
        </aside>
      `;
      return;
    }

    const fontTag = this.state.fontSize === 'xlarge' ? 'A++' : this.state.fontSize === 'large' ? 'A+' : 'A';
    const contrastTag = this.state.highContrast ? 'Contraste: ON' : 'Contraste';

    container.innerHTML = `
      <aside class="a11y-bar" aria-label="Ferramentas de Acessibilidade e Apoio ao Usuario">
        <div class="a11y-bar-left">
          <span><strong>Zelo</strong> &middot; Cuidados Paliativos Oncologicos</span>
          <span aria-hidden="true">|</span>
          <span>Central de Apoio: (41) 3000-0000</span>
        </div>
        <div class="a11y-bar-controls">
          <button type="button" class="a11y-btn" id="btn-a11y-font" onclick="AcessibilidadeController.toggleFontSize()" title="Alterar tamanho do texto (Alt+A)" aria-label="Alterar tamanho da fonte">
            [${fontTag}] Texto
          </button>
          <button type="button" class="a11y-btn" id="btn-a11y-contrast" onclick="AcessibilidadeController.toggleContrast()" title="Alternar alto contraste (Alt+C)" aria-label="Alternar alto contraste" aria-pressed="${this.state.highContrast}">
            ${contrastTag}
          </button>
          <button type="button" class="a11y-btn" id="btn-a11y-dark" onclick="AcessibilidadeController.toggleDarkMode()" title="Alternar tema claro e escuro" aria-label="Alternar tema claro e escuro">
            Tema
          </button>
          <button type="button" class="a11y-btn" id="btn-a11y-help" onclick="ZeloA11y.showHelpModal()" title="Instrucoes de navegacao e ajuda" aria-label="Ajuda e atalhos">
            Ajuda
          </button>
        </div>
      </aside>
    `;
  },

  showHelpModal() {
    let modal = document.getElementById('zelo-help-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'zelo-help-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="help-title">
          <h3 id="help-title">Ajuda e Diretrizes de Acessibilidade</h3>
          <p>Este sistema foi projetado com base em Fundamentos de Interacao Humano-Computador (IHC), Design Thinking e normas WCAG 2.2 AA/AAA, focado no conforto de pessoas idosas e equipes assistenciais:</p>
          <ul style="padding-left: 20px; margin-bottom: 20px; line-height: 1.6; font-size: 1rem;">
            <li><strong>Teclas de Atalho:</strong> Use <kbd>Alt + A</kbd> para aumentar o texto e <kbd>Alt + C</kbd> para alto contraste.</li>
            <li><strong>Alvos Táteis Amplos:</strong> Botões com dimensão mínima de 48x48px (56px para ações do idoso), facilitando o toque em condições de instabilidade motora.</li>
            <li><strong>Prevenção de Perda de Dados:</strong> O sistema solicita confirmação explícita antes de interromper qualquer registro em andamento.</li>
            <li><strong>Controle Semântico de Cores:</strong> As escalas de gravidade sempre associam rótulo textual descritivo ao indicador visual.</li>
          </ul>
          <div class="modal-actions">
            <button type="button" class="btn btn-primary" onclick="document.getElementById('zelo-help-modal').classList.remove('active')">Entendi e Fechar</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  }
};

// Exposição global garantida para ambos os identificadores
window.ZeloA11y = ZeloA11y;
window.AcessibilidadeController = ZeloA11y;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ZeloA11y.init());
} else {
  ZeloA11y.init();
}
