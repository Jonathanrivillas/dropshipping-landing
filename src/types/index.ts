// ============================================================
// TIPOS DE DOMINIO — Sojo Trendy
// Estos son los "contratos" de datos de toda la aplicación.
// Si cambias un tipo aquí, TypeScript te avisa en TODOS
// los archivos que lo usen. Ese es su superpoder.
// ============================================================

// ------------------------------------------------------------
// VARIANT
// Representa una dimensión de variación de un producto.
// Ejemplo: { type: "Talla", options: ["S", "M", "L", "XL"] }
// Un producto puede tener 0, 1 o 2 variantes.
// ------------------------------------------------------------
export interface Variant {
  type: string;       // "Talla", "Color", "Material", etc.
  options: string[];  // ["S", "M", "L"] o ["Rojo", "Azul"]
}

// ------------------------------------------------------------
// PRODUCT
// El objeto central de toda la aplicación.
// ------------------------------------------------------------
export interface Product {
  id: string;
  slug: string;           // URL-friendly: "camiseta-oversize-negra"
  name: string;
  description: string;
  price: number;          // Precio actual en COP
  compareAtPrice?: number; // Precio tachado (si existe → badge "Oferta")
  images: string[];       // Array de URLs. images[0] es la imagen principal
  category: string;       // "Ropa", "Accesorios", "Tecnología", "Hogar"
  tags: string[];         // ["verano", "tendencia", "unisex"]
  variants: Variant[];    // [] si no tiene variantes
  stock: number;          // 0 = agotado
  featured: boolean;      // true = aparece en la HomePage
  createdAt: string;      // ISO 8601: "2026-03-31T00:00:00Z"
}

// ------------------------------------------------------------
// CART ITEM
// Un producto dentro del carrito, con la variante elegida
// y la cantidad seleccionada.
// Lo usaremos en HU-06 y HU-07, pero lo definimos ahora
// para que el CartContext compile sin errores desde el inicio.
// ------------------------------------------------------------
export interface CartItem {
  product: Product;
  selectedVariants: Record<string, string>; // { "Talla": "M", "Color": "Rojo" }
  quantity: number;
}

// ------------------------------------------------------------
// ORDER
// Representa una orden de compra completada.
// Se guarda en la API al finalizar el checkout.
// ------------------------------------------------------------
export interface Order {
  id: string;                  // ID generado por la API (json-server lo asigna automáticamente)
  orderNumber: string;         // Número de orden visible para el usuario (ej: "ORD-2026-001234")
  customerInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    department: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    price: number;
    quantity: number;
    selectedVariants: Record<string, string>;
  }>;
  totalPrice: number;
  paymentMethod: 'card' | 'transfer' | 'mercadopago';
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  createdAt: string;           // ISO 8601
}