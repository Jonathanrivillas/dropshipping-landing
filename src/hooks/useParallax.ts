// ============================================================
// useParallax — Hook para efecto parallax en scroll
// ============================================================
// Aplica un desplazamiento vertical suave a un elemento basado
// en la posición del scroll. Perfecto para fondos decorativos.
//
// Uso:
//   const ref = useParallax(0.3); // 0.3 = velocidad (más bajo = más lento)
//   return <div ref={ref} className="parallax-element">...</div>
// ============================================================

import { useEffect, useRef } from 'react';

export function useParallax(speed: number = 0.5) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      if (!element) return;

      // Calcular qué tan lejos está el elemento viewport
      const rect = element.getBoundingClientRect();
      const scrolled = window.scrollY;
      const elementTop = rect.top + scrolled;
      const windowHeight = window.innerHeight;

      // Solo aplicar parallax si el elemento está cerca del viewport (optimización)
      if (rect.top < windowHeight && rect.bottom > 0) {
        const offset = (scrolled - elementTop + windowHeight) * speed;
        element.style.transform = `translateY(${offset}px)`;
      }
    };

    // Throttle para mejor performance
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    handleScroll(); // Ejecutar una vez al montar

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [speed]);

  return ref;
}
