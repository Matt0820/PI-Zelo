import React, { ReactNode } from 'react';

export interface EmptyStateProps {
  title: string;
  text: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EmptyState({
  title,
  text,
  icon = '📋',
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
