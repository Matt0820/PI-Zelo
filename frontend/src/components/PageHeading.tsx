/**
 * Padroniza o título, contexto e ação principal das páginas.
 */

import React, { ReactNode } from 'react';

/**
 * Conteúdo textual e ação opcional do cabeçalho da página.
 */
export interface PageHeadingProps {
  title: string;
  kicker?: string;
  description?: string;
  action?: ReactNode;
}

/**
 * Mostra título, contexto e ação de uma página.
 */
export function PageHeading({
  title,
  kicker,
  description,
  action
}: PageHeadingProps): React.JSX.Element {
  return (
    <div className="page-heading">
      <div>
        {kicker && <span className="eyebrow">{kicker}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="page-heading-action">{action}</div>}
    </div>
  );
}
