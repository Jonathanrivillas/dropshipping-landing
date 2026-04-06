// ============================================================
// PAGINATION COMPONENT
// ============================================================
// Controles de paginación con botones anterior/siguiente y números de página.
//
// PROPS:
//   currentPage  — Página actual (base 1)
//   totalPages   — Total de páginas disponibles
//   onPageChange — Callback cuando cambia la página: (page: number) => void
//
// COMPORTAMIENTO:
//   - Muestra máximo 5 números de página a la vez
//   - Botones "Anterior" y "Siguiente" deshabilitados según corresponda
//   - Página actual resaltada visualmente
//   - Responsive: texto completo en desktop, flechas simples en mobile
//
// EJEMPLO DE USO:
//   <Pagination 
//     currentPage={2}
//     totalPages={10}
//     onPageChange={(page) => setCurrentPage(page)}
//   />
// ============================================================

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Si hay 1 o 0 páginas, no mostrar controles
  if (totalPages <= 1) return null;

  // Calcular qué números de página mostrar (máximo 5)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar ventana deslizante de 5 páginas
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      // Ajustar si estamos cerca del inicio o final
      if (currentPage <= 3) {
        start = 1;
        end = maxVisible;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - maxVisible + 1;
        end = totalPages;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-2 mt-12">
      
      {/* Botón Anterior */}
      <button
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={[
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          currentPage === 1
            ? 'text-muted-foreground cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-muted hover:text-primary cursor-pointer',
        ].join(' ')}
        aria-label="Página anterior"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Anterior</span>
      </button>

      {/* Números de página */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={[
              'min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all',
              page === currentPage
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                : 'text-foreground hover:bg-muted hover:text-primary cursor-pointer',
            ].join(' ')}
            aria-label={`Página ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Botón Siguiente */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={[
          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
          currentPage === totalPages
            ? 'text-muted-foreground cursor-not-allowed opacity-50'
            : 'text-foreground hover:bg-muted hover:text-primary cursor-pointer',
        ].join(' ')}
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight size={16} />
      </button>
      
    </nav>
  );
}
