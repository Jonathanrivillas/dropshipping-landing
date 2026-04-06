// ============================================================
// CATÁLOGO DE PRODUCTOS — Sojo Trendy
// ============================================================
// Para AGREGAR un producto: copia cualquier bloque de abajo,
//   pégalo al final del array, modifica los campos y guarda.
// Para ELIMINAR un producto: borra su bloque del array.
// Para OCULTARLO sin borrarlo: pon stock: 0
//
// CAMPOS OBLIGATORIOS: id, slug, name, description, price,
//   images, category, tags, variants, stock, featured, createdAt
// CAMPOS OPCIONALES: compareAtPrice (genera badge "Oferta")
// ============================================================

import type { Product } from "../types";

export const products: Product[] = [
  // ----------------------------------------------------------
  // ROPA
  // ----------------------------------------------------------
  {
    id: '1',
    slug: 'camiseta-oversize-negra',
    name: 'Camiseta Oversize Negra',
    description:
      'Camiseta de algodón 100% con corte oversize para un look urbano y cómodo. Perfecta para el día a día.',
    price: 45000,
    compareAtPrice: 65000, // ← tiene precio tachado → mostrará badge "Oferta"
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600',
    ],
    category: 'Ropa',
    tags: ['oversize', 'casual', 'unisex'],
    variants: [
      { type: 'Talla', options: ['XS', 'S', 'M', 'L', 'XL'] },
      { type: 'Color', options: ['Negro', 'Blanco', 'Gris'] },
    ],
    stock: 50,
    featured: true,
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '2',
    slug: 'conjunto-deportivo-mujer',
    name: 'Conjunto Deportivo Mujer',
    description:
      'Set de top y licra de alto impacto con tela transpirable. Ideal para gym, yoga o running.',
    price: 89000,
    compareAtPrice: 120000,
    images: [
      'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600',
    ],
    category: 'Ropa',
    tags: ['deportivo', 'gym', 'mujer'],
    variants: [
      { type: 'Talla', options: ['XS', 'S', 'M', 'L'] },
      { type: 'Color', options: ['Negro', 'Azul marino', 'Rosa'] },
    ],
    stock: 30,
    featured: true,
    createdAt: '2026-03-05T00:00:00Z',
  },

  // ----------------------------------------------------------
  // ACCESORIOS
  // ----------------------------------------------------------
  {
    id: '3',
    slug: 'gorra-snapback-bordada',
    name: 'Gorra Snapback Bordada',
    description:
      'Gorra de estilo urbano con bordado frontal y cierre ajustable snapback. Talla única.',
    price: 38000,
    images: [
      'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600',
    ],
    category: 'Accesorios',
    tags: ['gorra', 'urbano', 'unisex'],
    variants: [
      { type: 'Color', options: ['Negro', 'Beige', 'Blanco'] },
    ],
    stock: 80,
    featured: false,
    createdAt: '2026-03-08T00:00:00Z',
  },
  {
    id: '4',
    slug: 'mochila-minimalista',
    name: 'Mochila Minimalista 20L',
    description:
      'Mochila urbana de 20 litros con compartimento para portátil de 15". Diseño limpio y resistente al agua.',
    price: 95000,
    compareAtPrice: 130000,
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
    ],
    category: 'Accesorios',
    tags: ['mochila', 'trabajo', 'viaje'],
    variants: [
      { type: 'Color', options: ['Negro', 'Gris oscuro'] },
    ],
    stock: 25,
    featured: true,
    createdAt: '2026-03-10T00:00:00Z',
  },

  // ----------------------------------------------------------
  // TECNOLOGÍA
  // ----------------------------------------------------------
  {
    id: '5',
    slug: 'audifonos-inalambricos-pro',
    name: 'Audífonos Inalámbricos Pro',
    description:
      'Audífonos Bluetooth 5.3 con cancelación de ruido activa, 30h de batería y estuche de carga incluido.',
    price: 189000,
    compareAtPrice: 250000,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
    ],
    category: 'Tecnología',
    tags: ['audifonos', 'bluetooth', 'musica'],
    variants: [
      { type: 'Color', options: ['Negro', 'Blanco', 'Azul'] },
    ],
    stock: 15,
    featured: true,
    createdAt: '2026-03-12T00:00:00Z',
  },
  {
    id: '6',
    slug: 'soporte-celular-escritorio',
    name: 'Soporte de Escritorio para Celular',
    description:
      'Soporte ajustable de aluminio compatible con todos los smartphones. Ángulo de 0 a 90 grados.',
    price: 28000,
    images: [
      'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600',
    ],
    category: 'Tecnología',
    tags: ['accesorios-tech', 'escritorio', 'productividad'],
    variants: [],  // ← sin variantes: el botón de compra aparece directamente
    stock: 100,
    featured: false,
    createdAt: '2026-03-15T00:00:00Z',
  },

  // ----------------------------------------------------------
  // HOGAR
  // ----------------------------------------------------------
  {
    id: '7',
    slug: 'lampara-led-ambiente',
    name: 'Lámpara LED de Ambiente',
    description:
      'Lámpara táctil recargable con 3 niveles de iluminación. Perfecta para escritorio o mesa de noche.',
    price: 55000,
    compareAtPrice: 75000,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
    ],
    category: 'Hogar',
    tags: ['lampara', 'decoracion', 'led'],
    variants: [
      { type: 'Color', options: ['Blanco', 'Madera natural'] },
    ],
    stock: 40,
    featured: true,
    createdAt: '2026-03-18T00:00:00Z',
  },
  {
    id: '8',
    slug: 'organizador-escritorio-bambu',
    name: 'Organizador de Escritorio en Bambú',
    description:
      'Set organizador de 5 piezas en bambú natural. Incluye porta-lápices, bandeja y separadores.',
    price: 72000,
    images: [
      'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
    ],
    category: 'Hogar',
    tags: ['organizador', 'bambu', 'minimalista'],
    variants: [],
    stock: 20,
    featured: false,
    createdAt: '2026-03-20T00:00:00Z',
  },
  {
    id: '9',
    slug: 'difusor-aromas-ultrasonico',
    name: 'Difusor de Aromas Ultrasónico',
    description:
      'Difusor de aceites esenciales con luz LED multicolor, temporizador y apagado automático. 300ml.',
    price: 68000,
    compareAtPrice: 90000,
    images: [
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600',
    ],
    category: 'Hogar',
    tags: ['aromaterapia', 'bienestar', 'hogar'],
    variants: [
      { type: 'Color', options: ['Blanco', 'Negro'] },
    ],
    stock: 35,
    featured: true,
    createdAt: '2026-03-22T00:00:00Z',
  },
  {
    id: '10',
    slug: 'riñonera-urbana',
    name: 'Riñonera Urbana',
    description:
      'Riñonera de tela resistente con compartimentos organizados. Se usa en cintura o cruzada al pecho.',
    price: 42000,
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600',
    ],
    category: 'Accesorios',
    tags: ['riñonera', 'urbano', 'festival'],
    variants: [
      { type: 'Color', options: ['Negro', 'Caqui', 'Azul'] },
    ],
    stock: 60,
    featured: false,
    createdAt: '2026-03-25T00:00:00Z',
  },
];