// ============================================================
// PRODUCT GRID — Orquestador de estados del catálogo
// ============================================================
// Decide qué renderizar según el estado de los datos:
//   isLoading → skeletons
//   []        → estado vacío
//   [...]     → grid de tarjetas
//
// La página que lo usa no necesita manejar estos estados.
// ============================================================

import { PackageX } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from './ProductCardSkeleton';
import { EmptyState } from './EmptyState';
import type { Product } from '../../types';

interface ProductGridProps {
    products: Product[];
    isLoading: boolean;
    onAddToCart: (product: Product) => void;
    // Cuántos skeletons mostrar mientras carga.
    // Default: 8 para llenar visualmente la pantalla.
    skeletonCount?: number;
    // Título y descripción del estado vacío (personalizables)
    emptyTitle?: string;
    emptyDescription?: string;
}

export function ProductGrid({
    products,
    isLoading,
    onAddToCart,
    skeletonCount = 8,
    emptyTitle = 'No hay productos disponibles',
    emptyDescription = 'En este momento no tenemos productos para mostrar. Vuelve pronto.',
}: ProductGridProps) {

    // ── ESTADO 1: CARGANDO ────────────────────────────────────
    // Array(n).fill(0) crea un array de n posiciones con valor 0.
    // Lo usamos solo para iterar n veces con .map().
    // El índice "i" es la key — está bien usarlo aquí porque
    // los skeletons son idénticos y nunca cambian de orden.
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                ))}
            </div>
        );
    }

    // ── ESTADO 2: VACÍO ───────────────────────────────────────
    if (products.length === 0) {
        return (
            <EmptyState
                icon={PackageX}
                title={emptyTitle}
                description={emptyDescription}
            />
        );
    }

    // ── ESTADO 3: CON DATOS ───────────────────────────────────
    // grid-cols-2: 2 columnas en mobile  (< 768px)
    // md:grid-cols-3: 3 columnas en tablet (≥ 768px)
    // lg:grid-cols-4: 4 columnas en desktop (≥ 1024px)
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product, i) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    index={i}
                />
            ))}
        </div>
    );
}