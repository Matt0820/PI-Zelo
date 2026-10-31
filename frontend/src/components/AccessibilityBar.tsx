import React, { useState, useRef, useEffect } from 'react';
import { useAccessibility, ModoVisual } from '../context/AccessibilityContext';

export function AccessibilityBar(): React.JSX.Element {
  const {
    modoVisual,
    setModoVisual,
    fontStep,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    reduzirMovimento,
    setReduzirMovimento,
    alternarAltoContraste,
    nomesModosVisuais,
    rotulosFontes
  } = useAccessibility();

  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora ou apertar Escape
  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuAberto(false);
      }
    }
    if (menuAberto) {
      document.addEventListener('mousedown', handleClickFora);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickFora);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuAberto]);

  return (
    <nav className="accessibility-bar" aria-label="Recursos de Acessibilidade">
      <div className="a11y-group" role="group" aria-label="Controle de Tamanho do Texto">
        <button
          type="button"
          className="a11y-btn"
          onClick={diminuirFonte}
          disabled={fontStep === 0}
          aria-label="Diminuir tamanho da letra"
          title="Diminuir tamanho da letra (A-)"
        >
          <span aria-hidden="true" style={{ fontSize: '13px', fontWeight: 700 }}>A-</span>
        </button>

        <button
          type="button"
          className="a11y-btn a11y-btn-indicator"
          onClick={resetarFonte}
          aria-label={`Tamanho atual: ${rotulosFontes[fontStep]}. Toque para restaurar tamanho padrão.`}
          title="Restaurar tamanho normal"
        >
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{rotulosFontes[fontStep].split(' ')[0]}</span>
        </button>

        <button
          type="button"
          className="a11y-btn"
          onClick={aumentarFonte}
          disabled={fontStep === 2}
          aria-label="Aumentar tamanho da letra"
          title="Aumentar tamanho da letra (A+)"
        >
          <span aria-hidden="true" style={{ fontSize: '17px', fontWeight: 700 }}>A+</span>
        </button>
      </div>

      <div className="a11y-group" role="group" aria-label="Contraste e Modos de Visão">
        <button
          type="button"
          className={`a11y-btn ${modoVisual === 'alto-contraste' ? 'active' : ''}`}
          onClick={alternarAltoContraste}
          aria-pressed={modoVisual === 'alto-contraste'}
          aria-label={
            modoVisual === 'alto-contraste'
              ? 'Desativar Alto Contraste e voltar ao modo padrão'
              : 'Ativar Modo Alto Contraste (WCAG AAA Preto e Amarelo)'
          }
          title="Alternar Alto Contraste"
        >
          <span aria-hidden="true" style={{ fontSize: '15px' }}>◐</span>
          <span>Alto Contraste</span>
        </button>

        <div className="a11y-dropdown-container" ref={menuRef}>
          <button
            type="button"
            className="a11y-btn"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-expanded={menuAberto}
            aria-haspopup="dialog"
            aria-label="Mais opções de acessibilidade e daltonismo"
          >
            <span>Opções Visuais ▾</span>
          </button>

          {menuAberto && (
            <div
              className="a11y-dropdown-menu"
              role="dialog"
              aria-label="Opções Visuais e Daltonismo"
            >
              <div className="a11y-menu-title">Modo Visual e Paleta:</div>
              {(Object.keys(nomesModosVisuais) as ModoVisual[]).map(modo => (
                <button
                  key={modo}
                  type="button"
                  className={`a11y-menu-item ${modoVisual === modo ? 'selected' : ''}`}
                  onClick={() => {
                    setModoVisual(modo);
                    setMenuAberto(false);
                  }}
                  role="radio"
                  aria-checked={modoVisual === modo}
                >
                  <span className="radio-dot">{modoVisual === modo ? '✓' : '○'}</span>
                  <span>{nomesModosVisuais[modo]}</span>
                </button>
              ))}

              <div className="a11y-menu-divider" />

              <label className="a11y-checkbox-item">
                <input
                  type="checkbox"
                  checked={reduzirMovimento}
                  onChange={e => setReduzirMovimento(e.target.checked)}
                />
                <span>Reduzir animações e movimento</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
