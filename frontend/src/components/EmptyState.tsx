/**
 * Apresenta uma mensagem acessível quando uma lista ou área não tem registros.
 */

import React, { ReactNode } from 'react';
import { Icon } from './ui';

/**
 * Texto e ação opcionais exibidos quando não há dados.
 */
export interface EmptyStateProps {
  title: string;
  text: string;
  icon?: ReactNode;
  action?: ReactNode;
}

/**
 * Informa de forma explícita que a área está vazia.
 */
export function EmptyState({
  title,
  text,
  icon = <Icon name="clipboard" size={24} />,
  action
}: EmptyStateProps): React.JSX.Element {
  return (
    <div className="empty" role="region" aria-label={title}>
      {icon && <div className="empty-icon" aria-hidden="true">{icon}</div>}
      <b>{title}</b>
      <p>{text}</p>
      {action && <div className="empty-action">{action}</div>}
    </div>
  );
}
