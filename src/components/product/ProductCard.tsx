// ============================================================
// PRODUCT CARD — Tarjeta de producto
// ============================================================
// Molécula principal del catálogo. Combina:
// - Badge (átomo) para la etiqueta "Oferta"
// - Button (átomo) para agregar al carrito
//
// Recibe el producto como prop y un callback onAddToCart.
// NO sabe nada del CartContext — eso lo maneja quien la usa.
// ============================================================

import { ShoppingCart, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import type { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  // Índice en el grid — permite efecto de aparición escalonada (stagger)
  index?: number;
}

// Formatea números como moneda colombiana.
// Intl.NumberFormat es nativo del navegador — no necesitas instalar nada.
// Resultado: 45000 → "$45.000"
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

export function ProductCard({ product, onAddToCart, index = 0 }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice !== undefined && product.compareAtPrice > product.price;
  const isOutOfStock = product.stock === 0;
  // Porcentaje de descuento — cálculo determinista (no Math.random)
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div
      className={`group flex flex-col rounded-2xl overflow-hidden border border-border bg-card shadow-md hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-300 ease-out animate-fade-up scroll-stagger-${Math.min(index + 1, 6)}`}
    >

      {/* ── IMAGEN — clickeable → navega al detalle ─────── */}
      <Link to={`/producto/${product.slug}`} className="block relative aspect-[4/5] overflow-hidden bg-muted">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay con "Ver detalle" — aparece suavemente al hover */}
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-all duration-300 flex items-center justify-center">
          <span className="flex items-center gap-1.5 bg-background text-foreground text-xs font-bold px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg">
            <Eye size={13} />
            Ver detalle
          </span>
        </div>

        {/* Badge % descuento — esquina superior izquierda */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 animate-scale-in">
            <Badge variant="offer">-{discountPct}%</Badge>
          </div>
        )}

        {/* Badge de agotado */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="default">Agotado</Badge>
          </div>
        )}
      </Link>

      {/* ── INFORMACIÓN ────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-4 gap-1">

        {/* Categoría como badge pequeño */}
        <Badge variant="category" className="self-start mb-1">
          {product.category}
        </Badge>

        {/* Nombre del producto — clickeable → navega al detalle */}
        <Link to={`/producto/${product.slug}`} className="group/name">
          <h3 className="font-semibold text-foreground text-sm leading-snug line-clamp-2 group-hover/name:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* ── PRECIOS ──────────────────────────────────────── */}
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-lg font-bold text-primary">
            {formatPrice(product.price)}
          </span>
          {hasDiscount && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(product.compareAtPrice!)}
            </span>
          )}
        </div>

        {/* ── BOTÓN ────────────────────────────────────────── */}
        <div className="mt-auto pt-3">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={16} />
            {isOutOfStock ? 'Agotado' : 'Agregar al carrito'}
          </Button>
        </div>

      </div>
    </div>
  );
}