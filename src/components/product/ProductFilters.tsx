// ============================================================
// PRODUCT FILTERS — Búsqueda LOCAL de productos + categorías
// ============================================================
// HU-02: chips de categoría (lifting state up)
// HU-03: búsqueda LOCAL para filtrar productos en la página
//
// DIFERENCIA con SearchBar del Navbar:
// - SearchBar (Navbar): búsqueda GLOBAL del ecommerce → navega con ?q=
// - Este campo: búsqueda LOCAL solo para filtrar productos en /tienda
// ============================================================

import { Search, X } from 'lucide-react';
import { getCategories } from '../../services/productService';
import { useState, useEffect } from 'react';
import { ProductSortSelect } from './ProductSortSelect';
import type { SortOrder } from './ProductSortSelect';

interface ProductFiltersProps {
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortOrder: SortOrder;
    onSortChange: (order: SortOrder) => void;
    totalResults: number;
    isLoading: boolean;
}

export function ProductFilters({
    selectedCategory,
    onCategoryChange,
    searchTerm,
    onSearchChange,
    sortOrder,
    onSortChange,
    totalResults,
    isLoading,
}: ProductFiltersProps) {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        getCategories().then(setCategories);
    }, []);

    const chips = [{ label: 'Todos', value: null }, ...categories.map(c => ({ label: c, value: c }))];
    const hasActiveFilter = selectedCategory !== null || searchTerm !== '';

    return (
        <div className="mb-8 space-y-4 animate-fade-up">

            {/* ── FILA SUPERIOR: búsqueda LOCAL + ordenamiento ─────────── */}
            <div className="flex flex-col sm:flex-row gap-3">

                {/* Buscador LOCAL (solo para filtrar productos en esta página) */}
                <div className="relative flex-1 max-w-md">

                    {/* Ícono lupa — posicionado a la izquierda del input */}
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                    />

                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        placeholder="Filtrar productos..."
                        className={[
                            'w-full rounded-xl border bg-card text-foreground placeholder:text-muted-foreground',
                            'pl-9 pr-9 py-2.5 text-sm',
                            'border-border focus:border-primary focus:ring-2 focus:ring-primary/20',
                            'outline-none transition-all duration-200',
                        ].join(' ')}
                    />

                    {/* Botón limpiar — solo visible si hay texto escrito */}
                    {searchTerm && (
                        <button
                            onClick={() => onSearchChange('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                            aria-label="Limpiar búsqueda"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* Selector de ordenamiento */}
                <ProductSortSelect
                    sortOrder={sortOrder}
                    onSortChange={onSortChange}
                    disabled={isLoading}
                />

            </div> {/* fin fila superior */}

            {/* ── CHIPS DE CATEGORÍA ────────────────────────────── */}
            <div className="flex flex-wrap gap-2">
                {chips.map(({ label, value }) => {
                    const isActive = selectedCategory === value;
                    return (
                        <button
                            key={label}
                            onClick={() => onCategoryChange(value)}
                            className={[
                                'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer',
                                'hover:-translate-y-0.5 active:scale-95',
                                isActive
                                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                                    : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-primary',
                            ].join(' ')}
                            aria-pressed={isActive}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>

            {/* ── CONTADOR DE RESULTADOS ────────────────────────── */}
            {!isLoading && hasActiveFilter && (
                <p className="text-sm text-muted-foreground animate-fade-in">
                    {totalResults === 0
                        ? `Sin resultados${searchTerm ? ` para "${searchTerm}"` : ''}${selectedCategory ? ` en "${selectedCategory}"` : ''}`
                        : `${totalResults} producto${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`
                    }
                </p>
            )}

        </div>
    );
}