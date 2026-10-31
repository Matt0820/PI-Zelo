import React, { ReactNode } from 'react';

export interface DataCellProps {
  label: string;
  value: ReactNode;
}

export function DataCell({ label, value }: DataCellProps): React.JSX.Element {
  return (
    <div className="data-cell">
      <dt>{label}</dt>
      <dd>{value ?? '—'}</dd>
    </div>
  );
}
