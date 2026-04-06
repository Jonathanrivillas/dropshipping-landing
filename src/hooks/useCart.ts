// ============================================================
// useCart — Hook personalizado del carrito
// ============================================================
// Los componentes NUNCA importan CartContext directamente.
// Siempre usan este hook. Razón: si el Context cambia de
// nombre o de librería, solo cambiamos este archivo.
// ============================================================

import { useContext } from 'react';
import { CartContext } from '../context/CartContext';

export function useCart() {
  const context = useContext(CartContext);

  // Protección: si alguien usa useCart() fuera del CartProvider,
  // falla rápido con un mensaje claro en lugar de un error críptico.
  if (!context) {
    throw new Error('useCart debe usarse dentro de un <CartProvider>');
  }

  return context;
}