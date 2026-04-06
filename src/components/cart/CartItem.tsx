// ============================================================
// CART ITEM — Fila de un producto dentro del CartDrawer
// ============================================================

import { Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../../hooks/useCart';
import type { CartItem as CartItemType } from '../../types';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCart();
    const { product, selectedVariants, quantity } = item;

    const variantLabels = Object.entries(selectedVariants)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ');

    return (
        <div className="flex gap-3 py-4 border-b border-border animate-fade-up">

            {/* Imagen */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border">
                <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground line-clamp-2 leading-snug">
                    {product.name}
                </p>
                {variantLabels && (
                    <p className="text-xs text-muted-foreground mt-0.5">{variantLabels}</p>
                )}
                {/* Precio unitario + subtotal del ítem */}
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.price * quantity)}
                  </span>
                  {quantity > 1 && (
                    <span className="text-xs text-muted-foreground">
                      ({formatPrice(product.price)} c/u)
                    </span>
                  )}
                </div>

                {/* Controles de cantidad */}
                <div className="flex items-center gap-2 mt-2">
                    <button
                        onClick={() => updateQuantity(product.id, quantity - 1, selectedVariants)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer active:scale-90"
                        aria-label="Disminuir cantidad"
                    >
                        <Minus size={12} />
                    </button>

                    <span className="text-sm font-semibold text-foreground w-6 text-center">
                        {quantity}
                    </span>

                    <button
                        onClick={() => updateQuantity(product.id, quantity + 1, selectedVariants)}
                        className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer active:scale-90"
                        aria-label="Aumentar cantidad"
                    >
                        <Plus size={12} />
                    </button>

                    <button
                        onClick={() => removeItem(product.id, selectedVariants)}
                        className="ml-auto text-muted-foreground hover:text-destructive transition-colors cursor-pointer active:scale-90"
                        aria-label={`Eliminar ${product.name}`}
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}