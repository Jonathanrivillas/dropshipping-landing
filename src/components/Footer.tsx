// ============================================================
// FOOTER — Sojo Trendy
// ============================================================
// Secciones: Logo + tagline | Links rápidos | Legal | Redes sociales
// Compatible con dark mode vía tokens CSS.
// ============================================================

import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import InstagramIcon from './icons/InstagramIcon';
import TikTokIcon from './icons/TikTokIcon';
import FacebookIcon from './icons/FacebookIcon';

const NAV_LINKS = [
  { label: 'Inicio', to: '/' },
  { label: 'Tienda', to: '/tienda' },
  { label: 'Checkout', to: '/checkout' },
];

const LEGAL_LINKS = [
  { label: 'Política de privacidad', to: '#' },
  { label: 'Términos y condiciones', to: '#' },
  { label: 'Política de devoluciones', to: '#' },
];

type IconComponent = ({ size, className }: { size?: number; className?: string }) => React.JSX.Element;

const SOCIAL_LINKS: { label: string; href: string; Icon: IconComponent }[] = [
  { label: 'Instagram', href: 'https://instagram.com', Icon: InstagramIcon },
  { label: 'TikTok', href: 'https://tiktok.com', Icon: TikTokIcon },
  { label: 'Facebook', href: 'https://facebook.com', Icon: FacebookIcon },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-navbar border-t border-indigo-300/20 mt-20">

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Columna 1 — Marca */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-indigo-500" />
            <span className="text-lg font-bold text-indigo-900 dark:text-white">
              Sojo Trendy
            </span>
          </div>
          <p className="text-sm text-indigo-700/80 dark:text-indigo-200/70 leading-relaxed max-w-xs">
            Moda y accesorios con estilo. Descubre productos únicos seleccionados
            especialmente para ti, con envíos a todo el país.
          </p>
          {/* Redes sociales */}
          <div className="flex items-center gap-3 pt-1">
            {SOCIAL_LINKS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="p-2 rounded-lg text-indigo-700 dark:text-indigo-300 hover:bg-indigo-500/15 hover:text-indigo-900 dark:hover:text-white transition-all duration-200 hover:scale-110"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {/* Columna 2 — Links rápidos */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Navegación
          </h3>
          <ul className="space-y-2.5">
            {NAV_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-white transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columna 3 — Legal */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
            Legal
          </h3>
          <ul className="space-y-2.5">
            {LEGAL_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  className="text-sm text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-white transition-colors duration-200"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* ── COPYRIGHT ─────────────────────────────────────── */}
      <div className="border-t border-indigo-300/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-indigo-600/70 dark:text-indigo-300/50">
          <p>© {year} Sojo Trendy. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Colombia</p>
        </div>
      </div>

    </footer>
  );
}
