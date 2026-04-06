// ============================================================
// BUTTON — Componente atómico reutilizable
// ============================================================
// Cubre el 100% de los botones de la app con variantes y tamaños.
// Hereda TODOS los props nativos de <button> gracias a extends.
// ============================================================

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

// ------------------------------------------------------------
// TIPOS
// Las variantes y tamaños son "union types" — solo esos valores
// son válidos. Si escribes variant="invalid" TypeScript lo marca.
// ------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
}

// ------------------------------------------------------------
// ESTILOS POR VARIANTE Y TAMAÑO
// Objeto de mapeo: evita un if/else largo.
// ------------------------------------------------------------
const variantStyles: Record<ButtonVariant, string> = {
  // bg-primary → CTA principal. Sombra de color para profundidad y foco visual.
  primary:
    'bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active disabled:opacity-40 hover:shadow-lg hover:shadow-primary/30',
  // Borde del color brand, fondo transparente al hover
  secondary:
    'bg-background text-primary border border-primary hover:bg-primary-subtle active:bg-primary-subtle disabled:opacity-50',
  // Sin borde ni fondo — máxima discreción
  ghost:
    'bg-transparent text-primary hover:bg-primary-subtle active:bg-primary-subtle disabled:opacity-50',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-base gap-2',
  lg: 'px-6 py-3 text-lg gap-2',
};

// ------------------------------------------------------------
// COMPONENTE
// forwardRef permite que el padre acceda al DOM del botón.
// Necesario para react-hook-form en el checkout (HU-09).
// ------------------------------------------------------------
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      children,
      isLoading = false,
      className = '',
      disabled,
      ...rest          // ← todos los demás props nativos: onClick, type, aria-*, etc.
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={[
          // Base: siempre presente en todos los botones
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-all duration-200 ease-out cursor-pointer',
          'active:scale-95',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed',
          'select-none',
          // Variante y tamaño específicos
          variantStyles[variant],
          sizeStyles[size],
          // className externo (el padre puede sobreescribir si necesita)
          className,
        ].join(' ')}
        {...rest}
      >
        {isLoading ? (
          // Spinner simple cuando hay estado de carga
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';