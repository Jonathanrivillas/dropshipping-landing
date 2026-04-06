// ============================================================
// CART CONTEXT — Sojo Trendy
// ============================================================
// Maneja el estado global del carrito con useReducer.
// Cualquier componente puede acceder al carrito llamando
// al hook useCart() sin necesidad de pasar props.
// ============================================================

import { createContext, useReducer, useEffect, useState } from 'react';import type { ReactNode } from 'react';
import type { CartItem, Product } from '../types';

// ------------------------------------------------------------
// 1. TIPOS DEL ESTADO Y LAS ACCIONES
// ------------------------------------------------------------

interface CartState {
  items: CartItem[];
}

// Una "union type" de todas las acciones posibles.
// El discriminante es el campo "type" — TypeScript sabe
// exactamente qué shape tiene "payload" en cada caso.
type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedVariants: Record<string, string> } }
  | { type: 'REMOVE_ITEM'; payload: { productId: string; selectedVariants: Record<string, string> } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; selectedVariants: Record<string, string>; quantity: number } }
  | { type: 'CLEAR_CART' };

// ------------------------------------------------------------
// 2. CLAVE DE LOCALSTORAGE
// ------------------------------------------------------------

const CART_STORAGE_KEY = 'sojo-trendy-cart';

// Genera una clave única para identificar un ítem del carrito.
// Un mismo producto con diferentes variantes son ítems distintos.
// Ejemplo: "5-Color:Blanco" vs "5-Color:Negro"
function getItemKey(productId: string, selectedVariants: Record<string, string>): string {
  const variantStr = Object.entries(selectedVariants)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
    .join('-');
  return variantStr ? `${productId}-${variantStr}` : productId;
}

// ------------------------------------------------------------
// 3. EL REDUCER
// ------------------------------------------------------------
// Función pura: (estado actual + acción) → nuevo estado
// NUNCA muta el estado directamente, siempre devuelve uno nuevo.
// ------------------------------------------------------------

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case 'ADD_ITEM': {
      const { product, selectedVariants } = action.payload;
      const key = getItemKey(product.id, selectedVariants);

      // Busca si ya existe ese ítem (mismo producto + mismas variantes)
      const existingIndex = state.items.findIndex(
        item => getItemKey(item.product.id, item.selectedVariants) === key
      );

      if (existingIndex >= 0) {
        // Ya existe: solo aumenta la cantidad
        const updatedItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return { items: updatedItems };
      }

      // No existe: agrega el ítem nuevo con cantidad 1
      return {
        items: [...state.items, { product, selectedVariants, quantity: 1 }],
      };
    }

    case 'REMOVE_ITEM': {
      const { productId, selectedVariants } = action.payload;
      const key = getItemKey(productId, selectedVariants);
      return {
        items: state.items.filter(
          item => getItemKey(item.product.id, item.selectedVariants) !== key
        ),
      };
    }

    case 'UPDATE_QUANTITY': {
      const { productId, selectedVariants, quantity } = action.payload;
      const key = getItemKey(productId, selectedVariants);

      // Si la cantidad llega a 0, elimina el ítem
      if (quantity <= 0) {
        return {
          items: state.items.filter(
            item => getItemKey(item.product.id, item.selectedVariants) !== key
          ),
        };
      }

      return {
        items: state.items.map(item =>
          getItemKey(item.product.id, item.selectedVariants) === key
            ? { ...item, quantity }
            : item
        ),
      };
    }

    case 'CLEAR_CART':
      return { items: [] };

    default:
      return state;
  }
}

// ------------------------------------------------------------
// 4. EL CONTEXT
// ------------------------------------------------------------
// Tipamos el valor del context para que useCart() tenga
// autocompletado completo en todos los componentes.
// ------------------------------------------------------------

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, selectedVariants?: Record<string, string>) => void;
  removeItem: (productId: string, selectedVariants?: Record<string, string>) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariants?: Record<string, string>) => void;
  clearCart: () => void;
  // Toast: el último producto agregado. null = sin notificación activa.
  lastAddedProduct: Product | null;
  clearLastAdded: () => void;
  // Contador que se incrementa en cada addItem. Se usa como `key`
  // en ToastContent para forzar un remontaje limpio (estado fresco)
  // sin necesidad de llamar setState den un efecto.
  toastKey: number;
}

// Usamos "null as unknown as CartContextValue" para evitar
// el valor inicial null y no tener que chequearlo en useCart.
// La protección real está en el hook useCart (paso 6).
const CartContext = createContext<CartContextValue>(null as unknown as CartContextValue);

// ------------------------------------------------------------
// 5. EL PROVIDER
// ------------------------------------------------------------
// Envuelve la app en App.tsx para que todos los componentes
// tengan acceso al carrito.
// ------------------------------------------------------------

interface CartProviderProps {
  children: ReactNode;
}

// Lee el carrito guardado en localStorage al iniciar.
// Si no hay nada guardado, empieza con el carrito vacío.
function getInitialState(): CartState {
  try {
    const saved = localStorage.getItem(CART_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { items: [] };
  } catch {
    return { items: [] };
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, undefined, getInitialState);
  // Estado local del drawer — vive aquí porque afecta a Navbar y CartDrawer
  const [isOpen, setIsOpen] = useState(false);
  // lastAddedProduct: alimenta el Toast de confirmación.
  // null = no hay toast activo. Se limpia desde el Toast con clearLastAdded.
  const [lastAddedProduct, setLastAddedProduct] = useState<Product | null>(null);
  // toastKey: sube 1 en cada addItem. Usado como key en ToastContent
  // para forzar remontaje limpio y resetear el estado de dismiss.
  const [toastKey, setToastKey] = useState(0);

  // Persiste el carrito en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Bloquea el scroll del body cuando el drawer está abierto.
  // El return limpia el efecto si el componente se desmonta.
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity, 0
  );

  const openCart  = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // addItem: agrega el producto, abre el drawer y dispara el toast
  const addItem = (product: Product, selectedVariants: Record<string, string> = {}) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedVariants } });
    setLastAddedProduct(product);  // dispara el Toast
    setToastKey(k => k + 1);       // fuerza remontaje de ToastContent
    setIsOpen(true);               // abre el drawer
  };

  const clearLastAdded = () => setLastAddedProduct(null);

  const removeItem = (productId: string, selectedVariants: Record<string, string> = {}) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { productId, selectedVariants } });
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariants: Record<string, string> = {}) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, selectedVariants, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ items: state.items, totalItems, totalPrice, isOpen, openCart, closeCart, addItem, removeItem, updateQuantity, clearCart, lastAddedProduct, clearLastAdded, toastKey }}>
      {children}
    </CartContext.Provider>
  );
}

// Exportamos el context para que useCart pueda usarlo
export { CartContext };