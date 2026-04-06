// ============================================================
// PRODUCT SORT SELECT — Selector de ordenamiento
// ============================================================
// Componente controlado: no tiene estado propio.
// Recibe sortOrder + onSortChange del padre (ShopPage).
// ============================================================

import { ArrowUpDown } from 'lucide-react';

export type SortOrder =
    | 'relevance'
    | 'price-asc'
    | 'price-desc'
    | 'newest';

interface ProductSortSelectProps {
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
    disabled?: boolean;
}

const SORT_OPTIONS: { value: SortOrder; label: string }[] = [
    { value: 'relevance', label: 'Relevancia' },
    { value: 'price-asc', label: 'Precio: menor a mayor' },
    { value: 'price-desc', label: 'Precio: mayor a menor' },
    { value: 'newest', label: 'Más nuevos' },
];

export function ProductSortSelect({
    sortOrder,
    onSortChange,
    disabled = false,
}: ProductSortSelectProps) {
    return (
        <div className="relative">
            <ArrowUpDown
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <select
                value={sortOrder}
                onChange={e => onSortChange(e.target.value as SortOrder)}
                disabled={disabled}
                className={[
                    'appearance-none rounded-xl border bg-card text-foreground',
                    'pl-8 pr-8 py-2.5 text-sm cursor-pointer',
                    'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                    'outline-none transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                ].join(' ')}
            >
                {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none text-xs">
                ▾
            </span>
        </div>
    );
}