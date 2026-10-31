import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'normal' | 'large';
  wide?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'normal',
  wide = false,
  loading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps): React.JSX.Element {
  const variantClass = {
    primary: 'button-primary',
    secondary: 'button-secondary',
    quiet: 'button-quiet',
    danger: 'button-danger'
  }[variant];

  const sizeClass = size === 'large' ? 'button-large' : '';
  const wideClass = wide ? 'button-wide' : '';

  return (
    <button
      className={`button ${variantClass} ${sizeClass} ${wideClass} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <>
          <span className="spinner" aria-hidden="true" />
          <span>{loadingText || 'Carregando…'}</span>
        </>
      ) : (
        <>
          {icon && <span className="button-icon" aria-hidden="true">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
