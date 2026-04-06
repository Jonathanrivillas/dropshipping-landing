// ============================================================
// BREADCRUMBS COMPONENT
// ============================================================
// Navegación jerárquica (migas de pan) con schema markup para SEO.
//
// PROPS:
//   items — Array de breadcrumb items: { label, href? }
//           Si href no existe, el item se renderiza como texto plano
//           (útil para el item actual/activo)
//
// EJEMPLO DE USO:
//   <Breadcrumbs items={[
//     { label: 'Inicio', href: '/' },
//     { label: 'Ropa', href: '/tienda?categoria=Ropa' },
//     { label: 'Camiseta Oversize Negra' }  // sin href = activo
//   ]} />
//
// SEO:
//   - Genera JSON-LD schema de tipo BreadcrumbList
//   - Mejora el ranking y la apariencia en resultados de búsqueda
// ============================================================

import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

interface BreadcrumbItem {
  label: string;
  href?: string; // Si no tiene href, se renderiza como texto (item actual)
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generar schema markup de JSON-LD para SEO
  const schemaMarkup = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href && { item: `${window.location.origin}${item.href}` }),
    })),
  };

  return (
    <>
      {/* Schema markup para Google */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Helmet>

      {/* Navegación visual */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-2">
                {/* Item con enlace */}
                {item.href && !isLast ? (
                  <Link
                    to={item.href}
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  /* Item activo (sin enlace) */
                  <span
                    className={
                      isLast
                        ? 'text-gray-900 dark:text-gray-100 font-medium'
                        : 'text-gray-600 dark:text-gray-400'
                    }
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </span>
                )}

                {/* Separador (excepto en el último item) */}
                {!isLast && (
                  <ChevronRight
                    className="w-4 h-4 text-gray-400 dark:text-gray-600"
                    aria-hidden="true"
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
