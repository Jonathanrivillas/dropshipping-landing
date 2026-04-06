// ============================================================
// PRODUCT CARD SKELETON
// ============================================================
// Replica el layout de ProductCard con átomos Skeleton.
// Debe tener EXACTAMENTE las mismas proporciones que ProductCard
// para evitar "layout shift" al cargar (los elementos no saltan).
// ============================================================

import { Skeleton } from '../ui/Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl overflow-hidden border border-border bg-card animate-fade-in">
      {/* Imagen — mismo aspect-ratio que ProductCard */}
      <Skeleton className="aspect-[4/5] w-full" />

      <div className="p-4 flex flex-col gap-2">
        {/* Badge placeholder */}
        <Skeleton className="h-5 w-16" />
        {/* Nombre del producto — línea larga */}
        <Skeleton className="h-5 w-full" />
        {/* Nombre del producto — segunda línea más corta */}
        <Skeleton className="h-5 w-3/4" />
        {/* Precio */}
        <Skeleton className="h-6 w-24 mt-1" />
        {/* Botón agregar al carrito */}
        <Skeleton className="h-10 w-full mt-2" />
      </div>
    </div>
  );
}