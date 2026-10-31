import type { ComponentProps, ElementType, ReactNode } from 'react';

export type IconName = 'accessibility' | 'alert-triangle' | 'bell' | 'bolt' | 'chat' | 'check' | 'clipboard' | 'clock' | 'home' | 'info' | 'logout' | 'map-pin' | 'phone' | 'pill' | 'plus' | 'stethoscope' | 'users';

const iconPaths: Record<IconName, ReactNode> = {
  accessibility: <><circle cx="12" cy="4" r="2"/><path d="M4 8h16M12 8v13m0-8-5 7m5-7 5 7"/></>,
  'alert-triangle': <><path d="M10.3 3.9 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4m0 4h.01"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
  bolt: <path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z"/>,
  chat: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 3.9a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clipboard: <><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5ZM9 10h6m-6 4h6m-6 4h3"/></>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1V10Z"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></>,
  logout: <><path d="M10 17l5-5-5-5m5 5H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></>,
  'map-pin': <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8L7.7 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5a2 2 0 0 1 2.2 2.5Z"/>,
  pill: <><path d="m10.6 13.4 2.8-2.8a4 4 0 0 1 5.7 5.7l-2.8 2.8a4 4 0 0 1-5.7-5.7Z"/><path d="m13.4 10.6-2.8 2.8a4 4 0 0 1-5.7-5.7l2.8-2.8a4 4 0 0 1 5.7 5.7Zm-5.7-2.9 5.6 5.6"/></>,
  plus: <path d="M12 5v14m-7-7h14"/>,
  stethoscope: <><path d="M6 3v5a4 4 0 0 0 8 0V3M4 3h4m4 0h4"/><path d="M10 12v2a6 6 0 0 0 12 0v-1"/><circle cx="22" cy="11" r="2"/><path d="M6 12v2"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.9m-1-12.9a4 4 0 0 1 0 7.8"/></>,
};

export function Icon({ name, size = 18, className = '' }: { name: IconName; size?: number; className?: string }) {
  return <svg className={`ui-icon${className ? ` ${className}` : ''}`} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{iconPaths[name]}</svg>;
}

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

export function NavigationItem({ children, icon, active = false, ...props }: ComponentProps<'button'> & { icon: IconName; active?: boolean }) {
  return <button className={`nav-item${active ? ' active' : ''}`} aria-current={active ? 'page' : undefined} {...props}>
    <span className="nav-icon" aria-hidden="true"><Icon name={icon} size={18}/></span>{children}
  </button>;
}
