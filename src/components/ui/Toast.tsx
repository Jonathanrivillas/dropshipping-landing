// ============================================================
// TOAST — Notificación temporal de confirmación
// ============================================================
// Aparece en la esquina inferior derecha y desaparece sola.
// Usa createPortal para estar por encima de todo el contenido.
//
// ARQUITECTURA DE DOS NIVELES (cumple reglas estrictas del linter):
//
//   Toast (outer) — lee el contexto. Renderiza ToastContent
//   ¦   con key={toastKey}. toastKey es un contador que sube
//   ¦   en CartContext cada vez que addItem() es llamado.
//   ¦   Cuando la key cambia ? React desmonta el viejo
//   ¦   ToastContent y monta uno nuevo con ESTADO FRESCO.
//   ¦   No necesita setState ni refs en el render.
//   ¦
//   +-- ToastContent (inner) — auto-contenido, sin props complejas.
//       Su useEffect tiene deps [] (solo corre en montaje).
//       El setState del timer vive DENTRO del callback del
//       setTimeout — no es síncrono en el body del efecto
//       ? el linter lo permite.
// ============================================================

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, X } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import type { Product } from '../../types';

// --- Inner component ------------------------------------------
interface ToastContentProps {
  product: Product;
  onDismiss: () => void;
}

function ToastContent({ product, onDismiss }: ToastContentProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  // deps [] ? solo corre al montarse el componente.
  // Cuando toastKey (outer) cambia, React desmonta este componente
  // y monta uno nuevo: isDismissing arranca en false automáticamente.
  // El setState está DENTRO del callback del setTimeout (no síncrono)
  // ? el linter no lo marca como violación.
  useEffect(() => {
    const timer = setTimeout(() => setIsDismissing(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return createPortal(
    <div
      onTransitionEnd={() => { if (isDismissing) onDismiss(); }}
      className={[
        'fixed bottom-6 right-6 z-[60] flex items-center gap-3',
        'bg-card border border-border rounded-2xl shadow-xl px-4 py-3',
        'max-w-xs w-full transition-all duration-300',
        !isDismissing
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-4 pointer-events-none',
      ].join(' ')}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 size={20} className="text-success flex-shrink-0" />

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground">
          Producto agregado
        </p>
        <p className="text-xs text-muted-foreground truncate">
          {product.name}
        </p>
      </div>

      <button
        onClick={() => setIsDismissing(true)}
        className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer flex-shrink-0"
        aria-label="Cerrar notificación"
      >
        <X size={14} />
      </button>
    </div>,
    document.body
  );
}

// --- Outer component ------------------------------------------
// toastKey es estado normal del context ? se puede leer en render.
// Cada nuevo addItem() incrementa toastKey en CartContext,
// forzando a React a remontar ToastContent con estado fresco.
export function Toast() {
  const { lastAddedProduct, clearLastAdded, toastKey } = useCart();

  if (!lastAddedProduct) return null;

  return (
    <ToastContent
      key={toastKey}
      product={lastAddedProduct}
      onDismiss={clearLastAdded}
    />
  );
}
