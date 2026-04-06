// ============================================================
// useDarkMode — Sojo Trendy
// ============================================================
// Gestiona el modo oscuro con persistencia en localStorage.
// Fallback: lee prefers-color-scheme si no hay preferencia guardada.
// Activa/desactiva la clase "dark" en <html> para que los tokens
// del archivo tokens.css (.dark { ... }) se apliquen.
// ============================================================

import { useEffect, useState } from 'react';

/** Lee la preferencia inicial: localStorage → prefers-color-scheme → light */
function getInitialTheme(): boolean {
  const stored = localStorage.getItem('sojo-theme');
  if (stored !== null) return stored === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useDarkMode() {
  const [isDark, setIsDark] = useState<boolean>(getInitialTheme);

  // Sincroniza la clase <html> y localStorage cada vez que cambia isDark
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('sojo-theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('sojo-theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
