import React, { ReactNode } from 'react';

export interface PageHeadingProps {
  title: string;
  kicker?: string;
  description?: string;
  action?: ReactNode;
}

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
