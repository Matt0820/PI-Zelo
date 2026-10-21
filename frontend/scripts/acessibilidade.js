/**
 * MODULO DE ACESSIBILIDADE GLOBAL (WCAG 2.2 AA/AAA & IHC PARA IDOSOS)
 * Sistema Zelo - Cuidados Paliativos Oncologicos
 */

const ZeloA11y = {
  state: {
    fontSize: 'normal', // 'normal', 'large', 'xlarge'
    highContrast: false,
    darkMode: false,
    reducedMotion: false,
  },

  init() {
    this.loadPreferences();
    this.applyPreferences();
    this.renderA11yBar();
    this.bindKeyboardShortcuts();
    this.updateUI();
  },

  loadPreferences() {
    try {
      const saved = localStorage.getItem('zelo_a11y_prefs');
      if (saved) {
        this.state = { ...this.state, ...JSON.parse(saved) };
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
    } catch (e) {
      console.warn('Erro ao salvar preferencias de acessibilidade:', e);
    }
  },

  applyPreferences() {
    const root = document.documentElement;
    const body = document.body;
    if (!root || !body) return;

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
    this.state.darkMode = !this.state.darkMode;
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
    }
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
    // Não renderiza barra de acessibilidade no fluxo mobile do paciente (configurações no perfil é suficiente)
    if (!container || window.location.pathname.includes('/paciente/')) {
      if (container) container.innerHTML = '';
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
          <button type="button" class="a11y-btn" id="btn-a11y-contrast" onclick="AcessibilidadeController.toggleContrast()" title="Alternar alto contraste (Alt+C)" aria-label="Alternar alto contraste">
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
