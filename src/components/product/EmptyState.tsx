// ============================================================
// EMPTY STATE — Estado vacío genérico
// ============================================================
// Reutilizable en: catálogo sin productos, carrito vacío,
// búsqueda sin resultados, etc.
//
// CONCEPTO AVANZADO: "icon" recibe el COMPONENTE de lucide-react
// (no una instancia), y lo renderizamos con <Icon />.
// Esto se llama "passing a component as a prop".
// ============================================================

import type { LucideIcon } from 'lucide-react';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  icon: LucideIcon;           // ej: ShoppingBag, Search, PackageX
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-up">
      {/* Renderizamos el componente de ícono recibido como prop */}
      <Icon
        size={64}
        className="text-muted-foreground/40 mb-4 transition-transform duration-500 hover:scale-110"
        strokeWidth={1}
      />

      <h3 className="text-xl font-semibold text-foreground mb-2">
        {title}
      </h3>

      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>

      {/* El botón de acción es opcional — solo aparece si se pasa */}
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}