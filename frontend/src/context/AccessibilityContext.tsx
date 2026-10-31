/**
 * Guarda preferências visuais e tipográficas e sincroniza as escolhas com o DOM e o armazenamento local.
 */

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';

/**
 * Identifica os esquemas visuais que a interface pode aplicar.
 */
export type ModoVisual =
  | 'padrao'
  | 'alto-contraste'
  | 'escuro'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia';

/**
 * Índice das três escalas tipográficas suportadas.
 */
export type FontStep = 0 | 1 | 2;

/**
 * Ações e valores disponibilizados aos componentes pelo contexto.
 */
export interface AccessibilityContextType {
  modoVisual: ModoVisual;
  setModoVisual: (modo: ModoVisual) => void;
  fontStep: FontStep;
  setFontStep: (step: FontStep) => void;
  aumentarFonte: () => void;
  diminuirFonte: () => void;
  resetarFonte: () => void;
  reduzirMovimento: boolean;
  setReduzirMovimento: (reduzir: boolean) => void;
  alternarAltoContraste: () => void;
  nomesModosVisuais: Record<ModoVisual, string>;
  rotulosFontes: Record<FontStep, string>;
}

const STORAGE_KEYS = {
  MODO_VISUAL: 'zelo_modo_visual',
  FONT_STEP: 'zelo_font_step',
  REDUCE_MOTION: 'zelo_reduzir_movimento'
};

const nomesModosVisuais: Record<ModoVisual, string> = {
  'padrao': 'Padrão (Cuidado Acolhedor)',
  'alto-contraste': 'Alto Contraste (Amarelo / Preto)',
  'escuro': 'Modo Noturno (Escuro Suave)',
  'protanopia': 'Protanopia (Sem Vermelho)',
  'deuteranopia': 'Deuteranopia (Sem Verde)',
  'tritanopia': 'Tritanopia (Sem Azul)'
};

const rotulosFontes: Record<FontStep, string> = {
  0: 'Normal (16px)',
  1: 'Grande (19px / +18%)',
  2: 'Muito Grande (22px / +37%)'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

function lerArmazenamento<T>(chave: string, valorPadrao: T): T {
  try {
    const item = localStorage.getItem(chave);
    if (item === null) return valorPadrao;
    return JSON.parse(item) as T;
  } catch {
    return valorPadrao;
  }
}

function salvarArmazenamento<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // Modo anônimo ou storage indisponível
  }
}

/**
 * Aplica preferências visuais, fonte e movimento à aplicação e sincroniza o armazenamento.
 */
export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [modoVisual, setModoVisualState] = useState<ModoVisual>(() => {
    const salvo = lerArmazenamento<ModoVisual | null>(STORAGE_KEYS.MODO_VISUAL, null);
    if (salvo && ['padrao', 'alto-contraste', 'escuro', 'protanopia', 'deuteranopia', 'tritanopia'].includes(salvo)) {
      return salvo;
    }
    // Detecção automática de preferência do sistema operacional
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'escuro';
    }
    return 'padrao';
  });

  const [fontStep, setFontStepState] = useState<FontStep>(() => {
    const salvo = lerArmazenamento<FontStep>(STORAGE_KEYS.FONT_STEP, 0);
    return ([0, 1, 2].includes(salvo) ? salvo : 0) as FontStep;
  });

  const [reduzirMovimento, setReduzirMovimentoState] = useState<boolean>(() => {
    const salvo = lerArmazenamento<boolean | null>(STORAGE_KEYS.REDUCE_MOTION, null);
    if (salvo !== null) return Boolean(salvo);
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return true;
    }
    return false;
  });

  // Atualiza classes do DOM
  useEffect(() => {
    const root = document.documentElement;
    root.lang = 'pt-BR';

    // Sincroniza atributo data-visual e classes tematicas
    root.setAttribute('data-visual', modoVisual);

    // Limpa temas anteriores
    root.classList.remove(
      'theme-padrao',
      'theme-high-contrast',
      'theme-dark',
      'theme-escuro',
      'theme-protanopia',
      'theme-deuteranopia',
      'theme-tritanopia'
    );

    if (modoVisual === 'alto-contraste') {
      root.classList.add('theme-high-contrast');
    } else if (modoVisual === 'escuro') {
      root.classList.add('theme-dark', 'theme-escuro');
    } else if (modoVisual === 'protanopia') {
      root.classList.add('theme-protanopia');
    } else if (modoVisual === 'deuteranopia') {
      root.classList.add('theme-deuteranopia');
    } else if (modoVisual === 'tritanopia') {
      root.classList.add('theme-tritanopia');
    } else {
      root.classList.add('theme-padrao');
    }

    salvarArmazenamento(STORAGE_KEYS.MODO_VISUAL, modoVisual);
  }, [modoVisual]);

  // Atualiza escala tipográfica no DOM
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('font-step-1', 'font-step-2');

    if (fontStep === 1) {
      root.classList.add('font-step-1');
      root.style.setProperty('--font-step', '1.18');
    } else if (fontStep === 2) {
      root.classList.add('font-step-2');
      root.style.setProperty('--font-step', '1.37');
    } else {
      root.style.setProperty('--font-step', '1');
    }

    salvarArmazenamento(STORAGE_KEYS.FONT_STEP, fontStep);
  }, [fontStep]);

  // Atualiza preferência de redução de movimento no DOM
  useEffect(() => {
    const root = document.documentElement;
    if (reduzirMovimento) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    salvarArmazenamento(STORAGE_KEYS.REDUCE_MOTION, reduzirMovimento);
  }, [reduzirMovimento]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setFontStepState(current => ((current + 1) % 3) as FontStep);
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setModoVisualState(current => current === 'alto-contraste' ? 'padrao' : 'alto-contraste');
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const setModoVisual = (modo: ModoVisual) => setModoVisualState(modo);
  const setFontStep = (step: FontStep) => setFontStepState(step);
  const setReduzirMovimento = (reduzir: boolean) => setReduzirMovimentoState(reduzir);

  const aumentarFonte = () => {
    setFontStepState(prev => (prev < 2 ? ((prev + 1) as FontStep) : prev));
  };

  const diminuirFonte = () => {
    setFontStepState(prev => (prev > 0 ? ((prev - 1) as FontStep) : prev));
  };

  const resetarFonte = () => {
    setFontStepState(0);
  };

  const alternarAltoContraste = () => {
    setModoVisualState(prev => (prev === 'alto-contraste' ? 'padrao' : 'alto-contraste'));
  };

  const value = useMemo<AccessibilityContextType>(
    () => ({
      modoVisual,
      setModoVisual,
      fontStep,
      setFontStep,
      aumentarFonte,
      diminuirFonte,
      resetarFonte,
      reduzirMovimento,
      setReduzirMovimento,
      alternarAltoContraste,
      nomesModosVisuais,
      rotulosFontes
    }),
    [modoVisual, fontStep, reduzirMovimento]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Lê as preferências de acessibilidade; exige um AccessibilityProvider acima na árvore.
 */
export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser utilizado dentro de um AccessibilityProvider.');
  }
  return context;
}
