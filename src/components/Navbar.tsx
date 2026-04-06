// ============================================================
// NAVBAR — Sojo Trendy
// ============================================================
// HU-16: hamburger menu mobile + menú desplegable animado.
// HU-17: dark mode toggle con persistencia en localStorage.
// Incluye: barra de búsqueda integrada.
// ============================================================

import { useState, useEffect } from 'react';
import { Menu, Moon, ShoppingCart, Sun, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useDarkMode } from '../hooks/useDarkMode';
import { useCart } from '../hooks/useCart';
import { SearchBar } from './SearchBar';

export default function Navbar() {
  const { totalItems, openCart } = useCart();
  const location = useLocation();
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  // Bloquea el scroll del body mientras el menú está abierto
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);
  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) => [
    'relative text-sm font-medium transition-colors duration-200',
    'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-indigo-500 dark:after:bg-indigo-400',
    'after:transition-all after:duration-300 after:ease-out',
    isActive(path)
      ? 'text-indigo-900 dark:text-white after:w-full'
      : 'text-indigo-700 dark:text-indigo-200 hover:text-indigo-900 dark:hover:text-white after:w-0 hover:after:w-full',
  ].join(' ');

  const iconBtnClass = 'relative p-2 rounded-lg text-indigo-800 dark:text-indigo-100 hover:bg-indigo-200 dark:hover:bg-white/10 hover:text-indigo-900 dark:hover:text-white transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95';

  return (
    <header className="sticky top-0 z-50 shadow-md bg-navbar">
      {/* Franja de acento indigo */}
      <div className="h-0.5 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-600" />

      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── LOGO ─────────────────────────────────────────── */}
        <Link
          to="/"
          className={[
            'text-xl font-bold tracking-tight transition-all duration-200 hover:scale-105 hover:opacity-90 inline-block flex-shrink-0',
            'bg-clip-text text-transparent',
            isDark
              ? 'bg-gradient-to-r from-indigo-300 to-indigo-100'
              : 'bg-gradient-to-r from-indigo-800 to-indigo-500',
          ].join(' ')}
        >
          Sojo Trendy
        </Link>

        {/* ── BÚSQUEDA — solo visible en md+ ────────────────── */}
        <div className="hidden md:block flex-1 max-w-md">
          <SearchBar placeholder="Buscar productos..." />
        </div>

        {/* ── LINKS — solo visibles en md+ ─────────────────── */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkClass('/')}>Inicio</Link>
          <Link to="/tienda" className={linkClass('/tienda')}>Tienda</Link>
        </div>

        {/* ── CONTROLES DERECHA ────────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Dark mode */}
          <button
            onClick={toggle}
            className={iconBtnClass}
            aria-label={isDark ? 'Activar modo claro' : 'Activar modo oscuro'}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark
              ? <Sun size={20} />
              : <Moon size={20} />
            }
          </button>

          {/* Carrito */}
          <button
            onClick={openCart}
            className={iconBtnClass}
            aria-label={`Carrito, ${totalItems} productos`}
            style={totalItems > 0 ? { animation: 'pulse-glow 2s ease-in-out infinite' } : undefined}
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-indigo-500 text-white text-xs font-bold flex items-center justify-center animate-scale-in">
                {totalItems > 9 ? '9+' : totalItems}
              </span>
            )}
          </button>

          {/* Hamburguesa — solo visible en mobile */}
          <button
            onClick={() => setMenuOpen(o => !o)}
            className={`${iconBtnClass} md:hidden`}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>
      </nav>

      {/* ── MENÚ MOBILE DESPLEGABLE ───────────────────────── */}
      {/* Animación: desliza desde arriba con opacity */}
      <div
        className={[
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        ].join(' ')}
        aria-hidden={!menuOpen}
      >
        <div className="px-4 pb-4 pt-2 flex flex-col gap-3 border-t border-indigo-300/20">
          
          {/* Búsqueda en mobile */}
          <SearchBar 
            placeholder="Buscar productos..." 
            onSearchStart={closeMenu}
          />

          {/* Links de navegación */}
          <Link
            to="/"
            onClick={closeMenu}
            className={[
              'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200',
              isActive('/')
                ? 'bg-indigo-500/15 text-indigo-900 dark:text-white'
                : 'text-indigo-700 dark:text-indigo-200 hover:bg-indigo-500/10 hover:text-indigo-900 dark:hover:text-white',
            ].join(' ')}
          >
            Inicio
          </Link>
          <Link
            to="/tienda"
            onClick={closeMenu}
            className={[
              'flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200',
              isActive('/tienda')
                ? 'bg-indigo-500/15 text-indigo-900 dark:text-white'
                : 'text-indigo-700 dark:text-indigo-200 hover:bg-indigo-500/10 hover:text-indigo-900 dark:hover:text-white',
            ].join(' ')}
          >
            Tienda
          </Link>
        </div>
      </div>

    </header>
  );
}