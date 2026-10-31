/**
 * Exibe uma métrica resumida com rótulo, valor e estado opcional de alerta.
 */

import React, { ReactNode } from 'react';

/**
 * Rótulo, valor e sinalização opcional de uma métrica.
 */
export interface MetricCardProps {
  label: string;
  value: number | string;
  danger?: boolean;
  subtext?: string;
  icon?: ReactNode;
}

/**
 * Exibe uma métrica e marca valores de alerta quando solicitado.
 */
export function MetricCard({
  label,
  value,
  danger = false,
  subtext,
  icon
}: MetricCardProps): React.JSX.Element {
  return (
    <article className={`metric ${danger ? 'danger' : ''}`}>
      <div className="metric-header">
        <span>{label}</span>
        {icon && <span className="metric-icon" aria-hidden="true">{icon}</span>}
      </div>
      <strong>{value}</strong>
      {subtext && <small className="metric-subtext">{subtext}</small>}
    </article>
  );
}
