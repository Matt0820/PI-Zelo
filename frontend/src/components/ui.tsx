import type { ComponentProps, ElementType, ReactNode } from 'react';

type ButtonProps = ComponentProps<'button'> & {
  variant?: 'primary' | 'secondary' | 'quiet';
  wide?: boolean;
};

export function Button({ variant = 'primary', wide = false, className = '', ...props }: ButtonProps) {
  return <button className={`button button-${variant}${wide ? ' button-wide' : ''}${className ? ` ${className}` : ''}`} {...props} />;
}

type CardProps<T extends ElementType = 'article'> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<T>, 'as' | 'children' | 'className'>;

export function Card<T extends ElementType = 'article'>({ as, children, className = '', ...props }: CardProps<T>) {
  const Component = as ?? 'article';
  return <Component className={`record-card${className ? ` ${className}` : ''}`} {...props}>{children}</Component>;
}

export function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`form-field${className ? ` ${className}` : ''}`}>
    <span>{label}</span>
    {children}
  </label>;
}

export function Feedback({ kind, children, onDismiss }: { kind: 'success' | 'error'; children: ReactNode; onDismiss?: () => void }) {
  return <div className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
    <span>{children}</span>
    {onDismiss && <button type="button" onClick={onDismiss} aria-label="Fechar aviso">×</button>}
  </div>;
}

export function ModalFrame({ id, kicker, kickerTone = 'default', title, onClose, children }: { id: string; kicker?: ReactNode; kickerTone?: 'default' | 'danger'; title: ReactNode; onClose: () => void; children: ReactNode }) {
  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal-card" role="dialog" aria-modal="true" aria-labelledby={id}>
      <div className="modal-head">
        <div>{kicker && <span className={`eyebrow${kickerTone === 'danger' ? ' eyebrow-danger' : ''}`}>{kicker}</span>}<h2 id={id}>{title}</h2></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Fechar">×</button>
      </div>
      {children}
    </section>
  </div>;
}

export function NavigationItem({ children, icon, active = false, ...props }: ComponentProps<'button'> & { icon: ReactNode; active?: boolean }) {
  return <button className={`nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} {...props}>
    <span className="nav-icon" aria-hidden="true">{icon}</span>{children}
  </button>;
}
