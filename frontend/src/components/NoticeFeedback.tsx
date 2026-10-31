import React from 'react';

export interface NoticeFeedbackProps {
  kind: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onDismiss?: () => void;
}

export function NoticeFeedback({
  kind,
  message,
  onDismiss
}: NoticeFeedbackProps): React.JSX.Element {
  const icon = {
    success: '✓',
    error: '!',
    warning: '!',
    info: 'ℹ'
  }[kind];

  const role = kind === 'error' ? 'alert' : 'status';

  return (
    <div
      className={`notice notice-${kind}`}
      role={role}
      aria-live="polite"
    >
      <div className="notice-content">
        <span className="notice-icon" aria-hidden="true">{icon}</span>
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
