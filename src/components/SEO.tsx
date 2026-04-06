// ============================================================
// SEO — Componente para meta tags dinámicos
// ============================================================
// Gestiona title, description, Open Graph, Twitter Cards.
// Usa react-helmet-async para SSR-safe meta tag management.
//
// Uso:
//   <SEO 
//     title="Página de inicio"
//     description="Descubre productos únicos"
//     canonical="/tienda"
//     image="https://..."
//   />
// ============================================================

import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  price?: string;
  currency?: string;
  noindex?: boolean;
}

const SITE_NAME = 'Sojo Trendy';
const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://sojotrendy.com';
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;
const DEFAULT_DESCRIPTION = 'Descubre productos cuidadosamente seleccionados para quienes buscan calidad, diseño y un precio justo. Envíos a toda Colombia.';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  image = DEFAULT_IMAGE,
  type = 'website',
  price,
  currency = 'COP',
  noindex = false,
}: SEOProps) {
  // Construir el título completo
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Tendencias que elevan tu estilo`;
  
  // URL canonical completa
  const canonicalUrl = canonical 
    ? `${SITE_URL}${canonical.startsWith('/') ? canonical : `/${canonical}`}` 
    : SITE_URL;

  // URL de imagen completa (si es relativa)
  const fullImageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return (
    <Helmet>
      {/* ── META TAGS BÁSICOS ───────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Indexación */}
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* ── OPEN GRAPH (Facebook, LinkedIn, etc.) ──────────── */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:locale" content="es_CO" />

      {/* Open Graph para productos */}
      {type === 'product' && price && (
        <>
          <meta property="product:price:amount" content={price} />
          <meta property="product:price:currency" content={currency} />
        </>
      )}

      {/* ── TWITTER CARDS ──────────────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* ── MOBILE & THEME ─────────────────────────────────── */}
      <meta name="theme-color" content="#6366f1" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* ── MICROFORMATOS JSON-LD para SEO ─────────────────── */}
      <script type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': type === 'product' ? 'Product' : 'WebSite',
          name: SITE_NAME,
          url: SITE_URL,
          description: DEFAULT_DESCRIPTION,
          ...(type === 'website' && {
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${SITE_URL}/tienda?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        })}
      </script>
    </Helmet>
  );
}
