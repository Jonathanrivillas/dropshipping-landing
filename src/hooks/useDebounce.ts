// ============================================================
// useDebounce — Hook genérico de debounce
// ============================================================
// Retrasa la actualización de un valor hasta que el usuario
// deja de cambiarlo por `delay` milisegundos.
//
// GENÉRICO con <T>: funciona con string, number, o cualquier tipo.
// Uso: const debouncedSearch = useDebounce(searchTerm, 300)
// ============================================================

import { useState, useEffect } from "react";

export function useDebounce<T>(value: T, delay: number = 300): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        // Programa la actualización después de `delay` ms
        const timer = setTimeout(() => {
        setDebouncedValue(value);
        }, delay);

        // LIMPIEZA: si `value` cambia antes de que pasen los `delay` ms,
        // cancela el timer anterior y programa uno nuevo.
        // Esto es lo que implementa el debounce.
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;    
}
