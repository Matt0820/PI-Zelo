/**
 * Define o botão reutilizável do portal e suas variantes visuais.
 */

import React, { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Propriedades visuais e nativas aceitas pelo botão compartilhado.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'quiet' | 'danger';
  size?: 'normal' | 'large';
  wide?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children: ReactNode;
}

/**
 * Renderiza um botão com variante e largura opcionais sem substituir os atributos nativos.
 */
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
