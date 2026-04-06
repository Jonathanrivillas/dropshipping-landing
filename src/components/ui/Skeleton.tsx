// ============================================================
// SKELETON — Placeholder animado de carga
// ============================================================
// Solo controla la animación de pulso.
// El TAMAÑO lo controla quien lo usa con className.
// Esto es el principio de "inversión de control".
// ============================================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={[
        'animate-pulse rounded-md bg-border',
        className,
      ].join(' ')}
    />
  );
}