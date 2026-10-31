import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';

export type TextScale = 'normal' | 'large' | 'xlarge';
export type ColorScheme = 'system' | 'light' | 'dark';
export type AccessibilityPreferences = {
  fontSize: TextScale;
  colorScheme: ColorScheme;
  highContrast: boolean;
};

const storageKey = '@zelo/web/accessibility';
const legacyVisualKey = '@zelo/web/visual';
const legacyA11yKey = 'zelo_a11y_prefs';
const defaults: AccessibilityPreferences = { fontSize: 'normal', colorScheme: 'system', highContrast: false };

function validPreferences(value: unknown): value is AccessibilityPreferences {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<AccessibilityPreferences>;
  return ['normal', 'large', 'xlarge'].includes(String(item.fontSize)) &&
    ['system', 'light', 'dark'].includes(String(item.colorScheme)) &&
    typeof item.highContrast === 'boolean';
}

function readPreferences(): AccessibilityPreferences {
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (validPreferences(parsed)) return parsed;
    }

    const legacyA11y = localStorage.getItem(legacyA11yKey);
    if (legacyA11y) {
      const parsed = JSON.parse(legacyA11y) as { fontSize?: string; highContrast?: boolean; darkMode?: boolean };
      return {
        fontSize: parsed.fontSize === 'large' || parsed.fontSize === 'xlarge' ? parsed.fontSize : 'normal',
        colorScheme: parsed.darkMode ? 'dark' : 'system',
        highContrast: Boolean(parsed.highContrast),
      };
    }

    const oldVisual = localStorage.getItem(legacyVisualKey);
    if (oldVisual === 'escuro') return { ...defaults, colorScheme: 'dark' };
    if (oldVisual === 'claro') return { ...defaults, colorScheme: 'light' };
    if (oldVisual === 'alto-contraste') return { ...defaults, highContrast: true };
  } catch {
    // Keep usable defaults if browser storage is unavailable or malformed.
  }
  return defaults;
}

type AccessibilityContextValue = {
  preferences: AccessibilityPreferences;
  storageAvailable: boolean;
  setFontSize: (fontSize: TextScale) => void;
  setColorScheme: (colorScheme: ColorScheme) => void;
  setHighContrast: (enabled: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const darkPreference = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => {
      const theme = preferences.colorScheme === 'system'
        ? (darkPreference.matches ? 'dark' : 'light')
        : preferences.colorScheme;
      root.dataset.theme = theme;
      root.dataset.fontScale = preferences.fontSize;
      root.dataset.contrast = preferences.highContrast ? 'high' : 'normal';
      root.style.colorScheme = preferences.highContrast || theme === 'dark' ? 'dark' : 'light';
    };
    apply();
    if (preferences.colorScheme !== 'system') return;
    if (darkPreference.addEventListener) darkPreference.addEventListener('change', apply);
    else darkPreference.addListener(apply);
    return () => {
      if (darkPreference.removeEventListener) darkPreference.removeEventListener('change', apply);
      else darkPreference.removeListener(apply);
    };
  }, [preferences]);

  useEffect(() => {
    const syncFromStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setPreferences(readPreferences());
    };
    window.addEventListener('storage', syncFromStorage);
    return () => window.removeEventListener('storage', syncFromStorage);
  }, []);

  useEffect(() => {
    const handleAccessibilityShortcut = (event: KeyboardEvent) => {
      if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      if (target instanceof HTMLElement && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]'))) return;
      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        setPreferences(current => ({
          ...current,
          fontSize: current.fontSize === 'normal' ? 'large' : current.fontSize === 'large' ? 'xlarge' : 'normal',
        }));
      } else if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        setPreferences(current => ({ ...current, highContrast: !current.highContrast }));
      }
    };
    window.addEventListener('keydown', handleAccessibilityShortcut);
    return () => window.removeEventListener('keydown', handleAccessibilityShortcut);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(preferences));
      setStorageAvailable(true);
    } catch {
      setStorageAvailable(false);
    }
  }, [preferences]);

  const value = useMemo<AccessibilityContextValue>(() => ({
    preferences,
    storageAvailable,
    setFontSize: fontSize => setPreferences(current => ({ ...current, fontSize })),
    setColorScheme: colorScheme => setPreferences(current => ({ ...current, colorScheme })),
    setHighContrast: highContrast => setPreferences(current => ({ ...current, highContrast })),
  }), [preferences, storageAvailable]);

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibilityPreferences() {
  const value = useContext(AccessibilityContext);
  if (!value) throw new Error('useAccessibilityPreferences precisa estar dentro de AccessibilityProvider.');
  return value;
}
