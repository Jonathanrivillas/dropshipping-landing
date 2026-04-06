// ============================================================
// BADGE — Etiqueta visual pequeña
// ============================================================
// Usada para: "Oferta", "Nuevo", nombres de categoría.
// "children" puede ser cualquier texto — es el contenido.
// ============================================================

import type { ReactNode } from 'react';

type BadgeVariant = 'offer' | 'new' | 'category' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  // Rojo sólido con brillo — máxima urgencia psicológica para ofertas
  offer:    'bg-destructive text-white shadow-sm',
  // Verde sólido — confianza y disponibilidad
  new:      'bg-success text-white shadow-sm',
  // Indigo sutil — identificación de categoría sin competir con CTA
  category: 'bg-primary/10 text-primary border border-primary/20',
  // Neutro — sin jerarquía visual fuerte
  default:  'bg-muted text-muted-foreground',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}