import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';

export type ModoVisual =
  | 'padrao'
  | 'alto-contraste'
  | 'escuro'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia';

export type FontStep = 0 | 1 | 2;

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

  // Atualiza classes do DOM e atributos semânticos
  useEffect(() => {
    const root = document.documentElement;
    root.lang = 'pt-BR';

    root.setAttribute('data-visual', modoVisual);

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

  // Sincronização multi-abas em tempo real (StorageEvent)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MODO_VISUAL && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (['padrao', 'alto-contraste', 'escuro', 'protanopia', 'deuteranopia', 'tritanopia'].includes(parsed)) {
            setModoVisualState(parsed);
          }
        } catch {
          // valor não-json
        }
      } else if (e.key === STORAGE_KEYS.FONT_STEP && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if ([0, 1, 2].includes(parsed)) setFontStepState(parsed);
        } catch {
          // valor não-json
        }
      } else if (e.key === STORAGE_KEYS.REDUCE_MOTION && e.newValue) {
        try {
          setReduzirMovimentoState(Boolean(JSON.parse(e.newValue)));
        } catch {
          // valor não-json
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Atalhos de teclado globais (Alt + Tecla) para acessibilidade motora e visual
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [contenteditable="true"]'))
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === 'a') {
        e.preventDefault();
        setFontStepState(prev => (prev < 2 ? ((prev + 1) as FontStep) : 0));
      } else if (key === 'c') {
        e.preventDefault();
        setModoVisualState(prev => (prev === 'alto-contraste' ? 'padrao' : 'alto-contraste'));
      } else if (key === 'e') {
        e.preventDefault();
        setModoVisualState(prev => (prev === 'escuro' ? 'padrao' : 'escuro'));
      } else if (key === '1') {
        e.preventDefault();
        setFontStepState(0);
      } else if (key === '2') {
        e.preventDefault();
        setFontStepState(1);
      } else if (key === '3') {
        e.preventDefault();
        setFontStepState(2);
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

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility deve ser utilizado dentro de um AccessibilityProvider.');
  }
  return context;
}

// Exportação de compatibilidade regressiva
export const useAccessibilityPreferences = useAccessibility;
