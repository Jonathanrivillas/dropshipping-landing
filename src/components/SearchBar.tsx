// ============================================================
// SEARCH BAR — Componente de búsqueda GLOBAL
// ============================================================
// Barra de búsqueda GLOBAL del ecommerce (Navbar).
// Navega a /tienda?q=... al presionar Enter (NO automático).
//
// DIFERENCIA con campo de filtro en ProductFilters:
// - Este SearchBar: búsqueda GLOBAL → navega a /tienda?q=... con Enter
// - ProductFilters: filtrado LOCAL automático dentro de /tienda
// ============================================================

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearchStart?: () => void; // Callback cuando se empieza a buscar (para cerrar menú mobile)
}

export function SearchBar({ className = '', placeholder = 'Buscar productos...', onSearchStart }: SearchBarProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Usa el parámetro de URL como valor inicial (solo en el montaje)
  const [query, setQuery] = useState(() => searchParams.get('q') || '');

  // Navega cuando el usuario presiona Enter o hace clic en buscar
  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      navigate(`/tienda?q=${encodeURIComponent(trimmedQuery)}`);
      if (onSearchStart) {
        onSearchStart(); // Cierra menú mobile si está abierto
      }
    } else if (!trimmedQuery && searchParams.get('q')) {
      // Si borra todo y había un parámetro, limpia la URL
      navigate('/tienda');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery('');
    if (searchParams.get('q')) {
      navigate('/tienda');
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Ícono de búsqueda */}
      <Search 
        size={18} 
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
      />
      
      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={[
          'w-full pl-10 pr-10 py-2 rounded-lg',
          'bg-card border border-border',
          'text-sm text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary',
          'transition-all duration-200',
        ].join(' ')}
      />

      {/* Botón de limpiar (solo visible si hay texto) */}
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-muted transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X size={16} className="text-muted-foreground" />
        </button>
      )}
    </div>
  );
}
