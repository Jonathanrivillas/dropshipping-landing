// ============================================================
// HOME PAGE — HU-11
// ============================================================
// La primera impresión del usuario. Diseñada con:
//   - Jerarquía visual clara: Hero → Propuestas → Destacados → Categorías
//   - CRO: cada sección empuja al usuario hacia una acción
//   - Animaciones escalonadas para guiar la atención
//   - Tokens semánticos del sistema de diseño — sin colores hardcodeados
//
// SECCIONES:
//   1. Hero         — Titular + subtítulo + CTA principal
//   2. Value Props  — 4 razones para comprar (confianza)
//   3. Destacados   — Grid de productos featured con skeleton
//   4. Categorías   — Navegación visual por categoría
//   5. Banner CTA   — Llamada final a la acción
// ============================================================

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { useParallax } from '../hooks/useParallax';
import { SEO } from '../components/SEO';
import {
  ArrowRight,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Headphones,
  Sparkles,
  Tag,
} from 'lucide-react';
import { getFeaturedProducts, getCategories } from '../services/productService';
import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/product/ProductCardSkeleton';
import { Button } from '../components/ui/Button';
import { useCart } from '../hooks/useCart';
import type { Product } from '../types';

// ─── Formato de precio ────────────────────────────────────────
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(price);

// ─── Emojis por categoría ────────────────────────────────────
const CATEGORY_META: Record<string, { emoji: string; description: string }> = {
  Ropa:        { emoji: '👗', description: 'Moda urbana y confort' },
  Accesorios:  { emoji: '💍', description: 'Estilo en cada detalle' },
  Tecnología:  { emoji: '⚡', description: 'Gadgets que marcan tendencia' },
  Hogar:       { emoji: '🏠', description: 'Tu espacio, tu estilo' },
};

// ─── Propuestas de valor ──────────────────────────────────────
const VALUE_PROPS = [
  {
    icon: Truck,
    title: 'Envío a todo Colombia',
    description: 'Recibe tu pedido en 3-7 días hábiles a cualquier ciudad.',
  },
  {
    icon: RefreshCcw,
    title: 'Devoluciones fáciles',
    description: '30 días para cambios o devoluciones sin complicaciones.',
  },
  {
    icon: ShieldCheck,
    title: 'Compra segura',
    description: 'Tus datos siempre protegidos. Pago 100% seguro.',
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está listo para ayudarte cuando lo necesites.',
  },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export function HomePage() {
  const { addItem } = useCart();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs para animaciones de scroll
  const heroTextRef = useScrollAnimation<HTMLDivElement>('scroll-animate-fade-up');
  const heroImageRef = useScrollAnimation<HTMLDivElement>('scroll-animate-slide-right', { delay: 200 });
  const valuePropsRef = useScrollAnimation<HTMLDivElement>('scroll-animate-fade-up');
  const featuredHeaderRef = useScrollAnimation<HTMLDivElement>('scroll-animate-fade-up');
  const featuredGridRef = useScrollAnimation<HTMLDivElement>('scroll-animate-zoom', { delay: 100 });
  const categoriesHeaderRef = useScrollAnimation<HTMLDivElement>('scroll-animate-blur');
  const categoriesGridRef = useScrollAnimation<HTMLDivElement>('scroll-animate-fade-up', { delay: 150 });
  const ctaBannerRef = useScrollAnimation<HTMLDivElement>('scroll-animate-scale', { delay: 100 });

  // Refs para efectos parallax en elementos decorativos
  const heroBlob1Ref = useParallax(0.15);
  const heroBlob2Ref = useParallax(0.25);

  // Carga paralela de productos destacados y categorías.
  // Promise.all espera a que AMBAS terminen antes de actualizar el estado.
  // Esto evita dos flashes de carga separados.
  useEffect(() => {
    Promise.all([getFeaturedProducts(), getCategories()])
      .then(([products, cats]) => {
        setFeaturedProducts(products);
        setCategories(cats);
        setError(null);
      })
      .catch(() => setError('Error al cargar los datos. Intenta recargar la página.'))
      .finally(() => setIsLoading(false));
  }, []);

  // ── RENDERS CONDICIONALES ─────────────────────────────────
  if (error) {
    return (
      <main className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-5xl mb-4">⚠️</p>
        <h2 className="text-2xl font-bold text-foreground mb-2">Error al cargar</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <div className="overflow-x-hidden">

      {/* SEO Meta Tags */}
      <SEO 
        title="Inicio"
        description="Descubre tendencias únicas en Sojo Trendy. Productos cuidadosamente seleccionados con envío a toda Colombia. Calidad, diseño y precios justos."
        canonical="/"
        type="website"
      />

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 1 — HERO
          El titular más grande de la página. Primera impresión.
          Objetivo: que el usuario entienda en 3 segundos qué
          vende Sojo Trendy y lo invite a explorar.
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-background">

        {/* Gradiente decorativo — blob de fondo */}
        <div
          ref={heroBlob1Ref}
          className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          ref={heroBlob2Ref}
          className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-10 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── TEXTO ────────────────────────────────────────── */}
          <div ref={heroTextRef} className="space-y-8">
            {/* Eyebrow — pequeña etiqueta sobre el título */}
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-semibold">
              <Sparkles size={14} />
              Colección 2026 — Recién llegados
            </div>

            {/* Título principal */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight">
              Tendencias{' '}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #818cf8)' }}
              >
                que elevan
              </span>{' '}
              tu estilo
            </h1>

            {/* Subtítulo */}
            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              Descubre productos cuidadosamente seleccionados para quienes
              buscan calidad, diseño y un{' '}
              <span className="text-foreground font-medium">precio justo</span>.
              Envíos a toda Colombia.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/tienda">
                <Button variant="primary" size="lg" className="group">
                  Explorar colección
                  <ArrowRight
                    size={18}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </Button>
              </Link>
              <Link to="/tienda">
                <Button variant="secondary" size="lg">
                  <Tag size={18} />
                  Ver ofertas
                </Button>
              </Link>
            </div>

            {/* Prueba social inline */}
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">+5.000</p>
                <p className="text-xs text-muted-foreground">Clientes felices</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">4.9★</p>
                <p className="text-xs text-muted-foreground">Calificación</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">72h</p>
                <p className="text-xs text-muted-foreground">Entrega promedio</p>
              </div>
            </div>
          </div>

          {/* ── IMAGEN HERO ──────────────────────────────────── */}
          <div
            ref={heroImageRef}
            className="relative hidden lg:block"
          >
            {/* Imagen principal */}
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                alt="Colección Sojo Trendy"
                className="w-full h-full object-cover"
              />
              {/* Overlay sutil */}
              <div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(to top, rgba(15,23,42,0.4) 0%, transparent 60%)' }}
              />
            </div>

            {/* Floating card — producto destacado */}
            <div
              className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl px-5 py-4 shadow-xl flex items-center gap-4 animate-fade-up scroll-stagger-3"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-border">
                <img
                  src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=100"
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Más vendido</p>
                <p className="text-sm font-semibold text-foreground">Camiseta Oversize</p>
                <p className="text-sm font-bold text-primary">{formatPrice(45000)}</p>
              </div>
            </div>

            {/* Floating badge — oferta */}
            <div
              className="absolute -top-4 -right-4 bg-destructive text-white text-xs font-bold px-3 py-2 rounded-xl shadow-lg animate-scale-in scroll-stagger-4"
            >
              Hasta 40% OFF
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-fade-in opacity-50 scroll-indicator">
          <span className="text-xs text-muted-foreground tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-border" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 2 — PROPUESTAS DE VALOR
          4 razones para comprar. Aparecen antes de los productos
          para construir confianza antes de pedir la compra.
      ══════════════════════════════════════════════════════ */}
      <section className="bg-muted/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div ref={valuePropsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {VALUE_PROPS.map(({ icon: Icon, title, description }, i) => (
              <div
                key={title}
                className={`flex flex-col items-center text-center gap-3 animate-fade-up scroll-stagger-${Math.min(i + 1, 6)}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={22} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 3 — PRODUCTOS DESTACADOS
          Los productos con featured: true del catálogo.
          Muestra skeletons mientras carga (evita CLS).
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Header de sección */}
        <div className="flex items-end justify-between mb-10">
          <div ref={featuredHeaderRef}>
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              Lo más pedido
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Productos destacados
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md">
              Selección curada de lo que más están comprando esta semana.
            </p>
          </div>
          <Link
            to="/tienda"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group"
          >
            Ver todo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Grid — skeletons mientras carga, cards cuando hay datos */}
        <div ref={featuredGridRef} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))
            : featuredProducts.slice(0, 8).map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addItem}
                  index={index}
                />
              ))
          }
        </div>

        {/* CTA móvil — solo visible en pantallas pequeñas */}
        <div className="mt-10 text-center sm:hidden">
          <Link to="/tienda">
            <Button variant="secondary" size="md">
              Ver todos los productos
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 4 — CATEGORÍAS
          Navegación visual. El usuario puede ir directo a la
          categoría que le interesa desde la home.
      ══════════════════════════════════════════════════════ */}
      <section className="bg-muted/40 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div ref={categoriesHeaderRef} className="text-center mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-2">
              Navega por sección
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Compra por categoría
            </h2>
          </div>

          {/* Grid de categorías — 2 cols móvil, 4 cols desktop */}
          <div ref={categoriesGridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-44 rounded-2xl bg-muted animate-pulse"
                  />
                ))
              : categories.map((cat, i) => {
                  const meta = CATEGORY_META[cat] ?? { emoji: '🛍️', description: 'Ver productos' };
                  return (
                    <Link
                      key={cat}
                      to={`/tienda?categoria=${encodeURIComponent(cat)}`}
                      className={`group relative flex flex-col items-center justify-center gap-3 h-44 rounded-2xl border border-border bg-card hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-up scroll-stagger-${Math.min(i + 1, 6)}`}
                    >
                      {/* Fondo tenue al hover */}
                      <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />

                      <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
                        {meta.emoji}
                      </span>
                      <div className="text-center relative">
                        <p className="font-bold text-foreground text-lg">{cat}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {meta.description}
                        </p>
                      </div>
                    </Link>
                  );
                })
            }
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECCIÓN 5 — BANNER CTA FINAL
          Último empuje antes de que el usuario salga.
          Urgencia + CTA claro + promesa de valor.
      ══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div
          ref={ctaBannerRef}
          className="relative rounded-3xl overflow-hidden px-8 py-16 text-center"
          style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)' }}
        >
          {/* Elementos decorativos de fondo */}
          <div
            className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }}
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 blur-2xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, #ffffff, transparent)' }}
            aria-hidden="true"
          />

          <div className="relative space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm">
              <Sparkles size={14} />
              Oferta por tiempo limitado
            </div>

            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight">
              Tu estilo empieza aquí.
              <br />
              <span className="text-white/80">Con precios que lo hacen posible.</span>
            </h2>

            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Más de 10 nuevos productos cada semana. Sé el primero en llevarlos.
            </p>

            <Link to="/tienda">
              <Button
                variant="secondary"
                size="lg"
                className="bg-white! text-primary! hover:bg-white/90! shadow-xl border-0! mt-2"
              >
                Descubrir ahora
                <ArrowRight size={18} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
