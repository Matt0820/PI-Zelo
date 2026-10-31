/**
 * Exibe um campo de prontuário com rótulo e valor em uma célula consistente.
 */

import React, { ReactNode } from 'react';

/**
 * Rótulo e valor que compõem uma célula de dados do prontuário.
 */
export interface DataCellProps {
  label: string;
  value: ReactNode;
}

/**
 * Exibe um dado rotulado do prontuário.
 */
export function DataCell({ label, value }: DataCellProps): React.JSX.Element {
  return (
    <div className="data-cell">
      <dt>{label}</dt>
      <dd>{value ?? '—'}</dd>
    </div>
  );
}
