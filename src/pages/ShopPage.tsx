// ============================================================
// SHOP PAGE — Página principal del catálogo
// ============================================================
// HU-01: carga de productos con estados loading/error/data
// HU-02: filtrado por categoría con lifting state up + useMemo
// HU-03: búsqueda LOCAL con debounce (filtrado en página)
//
// Si llegas con ?q= desde SearchBar del Navbar, inicializa el filtro local
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';
import { ProductGrid } from '../components/product/ProductGrid';
import { ProductFilters } from '../components/product/ProductFilters';
import { Pagination } from '../components/ui/Pagination';
import { useCart } from '../hooks/useCart';
import { getProducts } from '../services/productService';
import { SEO } from '../components/SEO';
import type { Product } from '../types';
import type { SortOrder } from '../components/product/ProductSortSelect';

// Configuración de paginación
const ITEMS_PER_PAGE = 12;

export function ShopPage() {
    // Lee los parámetros de la URL
    const [searchParams, setSearchParams] = useSearchParams();
    const categoriaParam = searchParams.get('categoria');
    const qParam = searchParams.get('q') || '';
    const pageParam = parseInt(searchParams.get('page') || '1', 10);

    // ── ESTADO: DATOS ─────────────────────────────────────────
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ── ESTADO: FILTROS ───────────────────────────────────────
    // categoriaParam como valor inicial — si viene de /tienda?categoria=Ropa, filtra directo
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoriaParam);
    // searchTerm local: si llegas con ?q= desde Navbar, lo usa como valor inicial
    const [searchTerm, setSearchTerm] = useState(qParam);
    const [sortOrder, setSortOrder] = useState<SortOrder>('relevance');
    const debouncedSearch = useDebounce(searchTerm, 300);
    
    // ── ESTADO: PAGINACIÓN ────────────────────────────────────
    const [currentPage, setCurrentPage] = useState(pageParam);

    const { addItem } = useCart();

    // ── EFECTO: CARGAR PRODUCTOS ──────────────────────────────
    useEffect(() => {
        getProducts()
            .then(data => { setProducts(data); setError(null); })
            .catch(() => setError('No pudimos cargar los productos. Intenta de nuevo.'))
            .finally(() => setIsLoading(false));
    }, []);
    
    // ── EFECTO: SINCRONIZAR PÁGINA CON URL ────────────────────
    useEffect(() => {
        setCurrentPage(pageParam);
    }, [pageParam]);
    
    // ── EFECTO: SINCRONIZAR FILTROS CON URL ───────────────────
    // Cuando la URL cambia (ej: navegas desde SearchBar), actualiza los filtros
    useEffect(() => {
        setSelectedCategory(categoriaParam);
    }, [categoriaParam]);
    
    useEffect(() => {
        setSearchTerm(qParam);
    }, [qParam]);

    // ── MEMO: PRODUCTOS FILTRADOS + ORDENADOS ─────────────────────
    // Paso 1: filtrar por categoría + búsqueda LOCAL (con debounce)
    // Paso 2: ordenar el resultado (NUNCA el array original)
    // [...arr] crea una copia antes de .sort() para no mutar el estado.
    const filteredProducts = useMemo(() => {
        const filtered = products.filter(p => {
            const matchesCategory = !selectedCategory || p.category === selectedCategory;
            
            // Búsqueda LOCAL (campo de filtro en ProductFilters)
            const term = debouncedSearch.toLowerCase().trim();
            const matchesSearch = !term ||
                p.name.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.tags.some(tag => tag.toLowerCase().includes(term));
            return matchesCategory && matchesSearch;
        });

        // Ordena una copia del array filtrado
        return [...filtered].sort((a, b) => {
            switch (sortOrder) {
                case 'price-asc':  return a.price - b.price;
                case 'price-desc': return b.price - a.price;
                case 'newest':     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:           return 0; // 'relevance': mantiene el orden original
            }
        });
    }, [products, selectedCategory, debouncedSearch, sortOrder]);

    // ── MEMO: PAGINACIÓN DE PRODUCTOS ─────────────────────────────
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    
    // Productos de la página actual
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage]);

    const handleAddToCart = (product: Product) => { addItem(product, {}); };
    
    const handleCategoryChange = (category: string | null) => { 
        setSelectedCategory(category);
        // Resetear a página 1 cuando cambia el filtro
        handlePageChange(1);
    };
    
    const handleSearchChange = (term: string) => { 
        setSearchTerm(term);
        // El debounce hará que se resetee después
    };
    
    const handleSortChange = (order: SortOrder) => { 
        setSortOrder(order);
        // Resetear a página 1 cuando cambia el ordenamiento
        handlePageChange(1);
    };
    
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        
        // Actualizar URL con parámetro page (excepto página 1)
        const newParams = new URLSearchParams(searchParams);
        if (page === 1) {
            newParams.delete('page');
        } else {
            newParams.set('page', page.toString());
        }
        setSearchParams(newParams, { replace: true });
        
        // Scroll suave hacia arriba al cambiar de página
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    
    // Efecto: resetear a página 1 cuando cambia la búsqueda (debounced)
    useEffect(() => {
        if (debouncedSearch) {
            handlePageChange(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    // ── RENDER: ERROR ─────────────────────────────────────────
    if (error) {
        return (
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center py-20">
                    <p className="text-destructive text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 text-primary underline cursor-pointer"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </main>
        );
    }

    // ── RENDER: PRINCIPAL ─────────────────────────────────────
    // Meta tags dinámicos según filtros activos
    const pageTitle = selectedCategory 
        ? `${selectedCategory}` 
        : debouncedSearch 
            ? `Resultados para "${debouncedSearch}"` 
            : 'Tienda';
    
    const pageDescription = selectedCategory
        ? `Explora nuestra colección de ${selectedCategory.toLowerCase()}. ${filteredProducts.length} productos disponibles con envío a toda Colombia.`
        : debouncedSearch
            ? `${filteredProducts.length} resultados encontrados para "${debouncedSearch}" en Sojo Trendy.`
            : `Descubre ${products.length} productos únicos en nuestra tienda online. Calidad, diseño y precios justos con envío a toda Colombia.`;

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">

            {/* SEO Meta Tags dinámicos */}
            <SEO 
                title={pageTitle}
                description={pageDescription}
                canonical={selectedCategory ? `/tienda?categoria=${selectedCategory}` : '/tienda'}
                type="website"
            />

            {/* Encabezado */}
            <div className="mb-6 animate-fade-up">
                <h1 className="text-3xl font-bold text-foreground">Tienda</h1>
                <p className="text-muted-foreground mt-1">
                    {isLoading
                        ? 'Cargando productos...'
                        : `${products.length} producto${products.length !== 1 ? 's' : ''} disponible${products.length !== 1 ? 's' : ''}`
                    }
                </p>
            </div>

            {/* Filtros: búsqueda LOCAL + categorías + ordenamiento */}
            <ProductFilters
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                totalResults={filteredProducts.length}
                isLoading={isLoading}
            />

            {/* Grid — recibe los productos PAGINADOS */}
            <ProductGrid
                products={paginatedProducts}
                isLoading={isLoading}
                onAddToCart={handleAddToCart}
                emptyTitle={
                    debouncedSearch
                        ? `Sin resultados para "${debouncedSearch}"`
                        : selectedCategory
                            ? `Sin productos en "${selectedCategory}"`
                            : 'Sin productos disponibles'
                }
                emptyDescription={
                    debouncedSearch
                        ? 'Intenta con otro término o limpia el filtro.'
                        : selectedCategory
                            ? 'No tenemos productos en esta categoría. Prueba con otra.'
                            : 'Agrega algunos productos para empezar.'
                }
            />
            
            {/* Controles de paginación */}
            {!isLoading && filteredProducts.length > 0 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                />
            )}

        </main>
    );
}