import React, { useEffect, useRef, ReactNode } from 'react';

export interface ModalDialogProps {
  title: string;
  kicker?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  size?: 'normal' | 'large';
}

export function ModalDialog({
  title,
  kicker,
  onClose,
  children,
  actions,
  size = 'normal'
}: ModalDialogProps): React.JSX.Element {
  const modalRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    // Foco automático no botão de fechar ao abrir
    closeBtnRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={modalRef}
        className={`modal-card ${size === 'large' ? 'modal-card-large' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-dialog-title"
      >
        <div className="modal-head">
          <div>
            {kicker && <span className="eyebrow">{kicker}</span>}
            <h2 id="modal-dialog-title">{title}</h2>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Fechar janela"
            title="Fechar (Esc)"
          >
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>

        {actions && <div className="modal-actions">{actions}</div>}
      </section>
    </div>
  );
}
