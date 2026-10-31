/**
 * Apresenta feedback de sucesso, erro ou aviso com semântica de status.
 */

import React from 'react';
import { Icon, type IconName } from './ui';

/**
 * Tipo de mensagem, conteúdo e ação opcional para dispensá-la.
 */
export interface NoticeFeedbackProps {
  kind: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

/**
 * Renderiza feedback com papel de status/alerta conforme a gravidade.
 */
export function NoticeFeedback({
  kind,
  message,
  onDismiss
}: NoticeFeedbackProps): React.JSX.Element {
  const icons: Record<NoticeFeedbackProps['kind'], IconName> = {
    success: 'check',
    error: 'alert-triangle',
    warning: 'bolt',
    info: 'info'
  };
  const icon = icons[kind];

  const role = kind === 'error' ? 'alert' : 'status';

  return (
    <div
      className={`notice notice-${kind}`}
      role={role}
      aria-live="polite"
    >
      <div className="notice-content">
        <span className="notice-icon" aria-hidden="true"><Icon name={icon} size={18}/></span>
        <span className="notice-text">{message}</span>
      </div>
      {onDismiss && (
        <button
          type="button"
          className="notice-dismiss"
          onClick={onDismiss}
          aria-label="Fechar notificação"
          title="Fechar"
        >
          ×
        </button>
      )}
    </div>
  );
}
