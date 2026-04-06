// ============================================================
// useScrollAnimation — Hook para animaciones de scroll
// ============================================================
// Detecta cuando un elemento entra en el viewport y le agrega
// una clase para triggear la animación CSS.
//
// Uso:
//   const ref = useScrollAnimation('fade-up-spring');
//   return <div ref={ref}>...</div>
// ============================================================

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;      // % del elemento visible para triggear (0.0 - 1.0)
  rootMargin?: string;     // Margen adicional para triggear antes/después
  triggerOnce?: boolean;   // Si true, solo anima una vez
  delay?: number;          // Delay antes de agregar la clase (ms)
}

export function useScrollAnimation<T extends HTMLElement>(
  animationClass: string = 'scroll-animate-fade-up',
  options: UseScrollAnimationOptions = {}
) {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true,
    delay = 0,
  } = options;

  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Agregar clase inicial de "pre-animación" (oculto)
    element.classList.add('scroll-animate');
    element.style.opacity = '0';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          // Elemento visible — triggear animación
          if (delay > 0) {
            setTimeout(() => {
              element.classList.add(animationClass);
              setIsVisible(true);
            }, delay);
          } else {
            element.classList.add(animationClass);
            setIsVisible(true);
          }

          // Si triggerOnce, desconectar el observer
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!entry.isIntersecting && !triggerOnce) {
          // Elemento fuera de vista — remover animación (si no es triggerOnce)
          element.classList.remove(animationClass);
          setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [animationClass, threshold, rootMargin, triggerOnce, delay, isVisible]);

  return ref;
}
