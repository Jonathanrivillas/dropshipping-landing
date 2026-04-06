// ============================================================
// PRODUCT DETAIL PAGE — /producto/:id
// ============================================================
// HU-05: galería de imágenes, selector de variantes,
//        botón de compra condicional, productos relacionados,
//        breadcrumb de navegación.
// ============================================================

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { getProductBySlug, getProducts } from '../services/productService';
import { useCart } from '../hooks/useCart';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProductCard } from '../components/product/ProductCard';
import { Skeleton } from '../components/ui/Skeleton';
import { SEO } from '../components/SEO';
import { Breadcrumbs } from '../components/Breadcrumbs';
import type { Product } from '../types';

// ── FORMATO DE PRECIO ─────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

// ── SKELETON DE LA PÁGINA COMPLETA ────────────────────────
function ProductDetailSkeleton() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-20 h-20 rounded-xl" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-9 w-2/4" />
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </main>
  );
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────
export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // ── ESTADO ───────────────────────────────────────────────
  // product === null + notFound === false → cargando
  // product === null + notFound === true  → no encontrado
  // product !== null                      → datos listos
  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Imagen seleccionada en la galería (índice)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Variantes seleccionadas: { "Talla": "M", "Color": "Negro" }
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  // ── CARGAR PRODUCTO ───────────────────────────────────────
  // Cada vez que el :id cambia, el componente se remonta porque
  // App.tsx usa key={id} en esta ruta. Por eso el estado ya
  // inicia limpio y no necesitamos resetear nada aquí.
  useEffect(() => {
    Promise.all([
      getProductBySlug(slug!),
      getProducts(),
    ])
      .then(([found, products]) => {
        if (!found) { setNotFound(true); return; }
        setProduct(found);
        setAllProducts(products);
        setError(null);
      })
      .catch(() => setError('Error al cargar el producto. Intenta de nuevo.'))
      .finally(() => setIsLoading(false));
  }, [slug]);  // ← [slug]: se re-ejecuta cada vez que cambia el :slug de la URL

  // ── PRODUCTOS RELACIONADOS ────────────────────────────────
  // Misma categoría, excluye el actual, máximo 4.
  // useMemo: solo recalcula si cambia product o allProducts.
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product, allProducts]);

  // ── LÓGICA DEL BOTÓN ─────────────────────────────────────
  // El botón se desactiva si el producto tiene variantes
  // y el usuario no ha seleccionado todas.
  const allVariantsSelected = product
    ? product.variants.every(v => selectedVariants[v.type])
    : false;

  const canAddToCart =
    product !== null &&
    product.stock > 0 &&
    (product.variants.length === 0 || allVariantsSelected);

  const handleVariantSelect = (type: string, option: string) => {
    setSelectedVariants(prev => ({ ...prev, [type]: option }));
  };

  const handleAddToCart = () => {
    if (!product || !canAddToCart) return;
    addItem(product, selectedVariants);
    // En HU-06 abriremos el drawer del carrito aquí
  };

  // ── RENDERS CONDICIONALES ─────────────────────────────────
  if (isLoading) return <ProductDetailSkeleton />;

  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">Error al cargar</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={() => window.location.reload()}>Reintentar</Button>
      </main>
    );
  }

  if (notFound || !product) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">Producto no encontrado</h2>
        <p className="text-muted-foreground mb-6">Este producto no existe o fue eliminado.</p>
        <Button onClick={() => navigate('/tienda')}>Volver a la tienda</Button>
      </main>
    );
  }

  const hasDiscount =
    product.compareAtPrice !== undefined &&
    product.compareAtPrice > product.price;

  const discountPercent = hasDiscount
    ? Math.round((1 - product.price / product.compareAtPrice!) * 100)
    : 0;

  // ── RENDER PRINCIPAL ──────────────────────────────────────
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">

      {/* SEO Meta Tags dinámicos para producto */}
      <SEO 
        title={product.name}
        description={`${product.description} - ${formatPrice(product.price)}. ${product.stock > 0 ? 'Disponible' : 'Agotado'}. Envío a toda Colombia.`}
        canonical={`/producto/${product.id}`}
        image={product.images[0]}
        type="product"
        price={product.price.toString()}
        currency="COP"
      />

      {/* ── BREADCRUMB CON SCHEMA MARKUP ─────────────────── */}
      <Breadcrumbs 
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Tienda', href: '/tienda' },
          { label: product.category, href: `/tienda?categoria=${encodeURIComponent(product.category)}` },
          { label: product.name }, // Sin href = item actual
        ]}
      />

      {/* ── GRID PRINCIPAL: galería + info ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

        {/* ── GALERÍA ─────────────────────────────────── */}
        <div className="space-y-3 animate-fade-up">

          {/* Imagen principal */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-muted border border-border">
            <img
              key={selectedImageIndex}  // key fuerza re-mount → dispara animación
              src={product.images[selectedImageIndex]}
              alt={product.name}
              className="w-full h-full object-cover animate-fade-in"
            />
          </div>

          {/* Miniaturas — solo si hay más de 1 imagen */}
          {product.images.length > 1 && (
            <div className="flex gap-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={[
                    'w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer flex-shrink-0',
                    i === selectedImageIndex
                      ? 'border-primary shadow-md shadow-primary/20 scale-105'
                      : 'border-border hover:border-primary/50 opacity-70 hover:opacity-100',
                  ].join(' ')}
                  aria-label={`Ver imagen ${i + 1}`}
                >
                  <img src={img} alt={`Vista ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── INFORMACIÓN ─────────────────────────────── */}
        <div
          className="flex flex-col gap-5 animate-fade-up"
          style={{ animationDelay: '100ms' }}
        >
          {/* Categoría + badges */}
          <div className="flex items-center gap-2">
            <Badge variant="category">{product.category}</Badge>
            {hasDiscount && <Badge variant="offer">-{discountPercent}% OFF</Badge>}
            {product.stock <= 5 && product.stock > 0 && (
              <Badge variant="default">¡Solo {product.stock} disponibles!</Badge>
            )}
          </div>

          {/* Nombre */}
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            {product.name}
          </h1>

          {/* Precios */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Descripción */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* ── SELECTOR DE VARIANTES ────────────────── */}
          {/* Solo aparece si el producto tiene variantes definidas */}
          {product.variants.length > 0 && (
            <div className="space-y-4">
              {product.variants.map(variant => (
                <div key={variant.type}>
                  <p className="text-sm font-semibold text-foreground mb-2">
                    {variant.type}:
                    {/* Muestra la opción seleccionada junto al label */}
                    {selectedVariants[variant.type] && (
                      <span className="font-normal text-primary ml-1">
                        {selectedVariants[variant.type]}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map(option => {
                      const isSelected = selectedVariants[variant.type] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleVariantSelect(variant.type, option)}
                          className={[
                            'px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200 cursor-pointer',
                            'hover:scale-105 active:scale-95',
                            isSelected
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/30'
                              : 'bg-card text-foreground border-border hover:border-primary',
                          ].join(' ')}
                          aria-pressed={isSelected}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Aviso cuando no se han seleccionado todas las variantes */}
              {!allVariantsSelected && (
                <p className="text-sm text-muted-foreground animate-fade-in">
                  Por favor selecciona{' '}
                  {product.variants
                    .filter(v => !selectedVariants[v.type])
                    .map(v => v.type.toLowerCase())
                    .join(' y ')}
                </p>
              )}
            </div>
          )}

          {/* ── BOTÓN AGREGAR AL CARRITO ─────────────── */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              className="flex-1"
              disabled={!canAddToCart}
              onClick={handleAddToCart}
              aria-label={
                product.stock === 0
                  ? 'Producto agotado'
                  : !allVariantsSelected
                  ? 'Selecciona todas las opciones'
                  : `Agregar ${product.name} al carrito`
              }
            >
              <ShoppingCart size={20} />
              {product.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={() => navigate(-1)}
              aria-label="Volver a la página anterior"
            >
              <ArrowLeft size={20} />
            </Button>
          </div>

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
              {product.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── PRODUCTOS RELACIONADOS ───────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="animate-fade-up" style={{ animationDelay: '200ms' }}>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            También te puede gustar
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((related, i) => (
              <ProductCard
                key={related.id}
                product={related}
                onAddToCart={(p) => addItem(p, {})}
                index={i}
              />
            ))}
          </div>
        </section>
      )}

    </main>
  );
}
