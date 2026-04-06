import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const seedProducts = [
  {
    slug: 'camiseta-oversize-negra',
    name: 'Camiseta Oversize Negra',
    description: 'Camiseta de algodon 100% con corte oversize para un look urbano y comodo. Perfecta para el dia a dia.',
    price: 45000,
    compareAtPrice: 65000,
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600', 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600'],
    category: 'Ropa',
    tags: ['oversize', 'casual', 'unisex'],
    variants: [{ type: 'Talla', options: ['XS', 'S', 'M', 'L', 'XL'] }, { type: 'Color', options: ['Negro', 'Blanco', 'Gris'] }],
    stock: 50,
    featured: true,
  },
  {
    slug: 'conjunto-deportivo-mujer',
    name: 'Conjunto Deportivo Mujer',
    description: 'Set de top y licra de alto impacto con tela transpirable. Ideal para gym, yoga o running.',
    price: 89000,
    compareAtPrice: 120000,
    images: ['https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600'],
    category: 'Ropa',
    tags: ['deportivo', 'gym', 'mujer'],
    variants: [{ type: 'Talla', options: ['XS', 'S', 'M', 'L'] }, { type: 'Color', options: ['Negro', 'Azul marino', 'Rosa'] }],
    stock: 30,
    featured: true,
  },
  {
    slug: 'gorra-snapback-bordada',
    name: 'Gorra Snapback Bordada',
    description: 'Gorra de estilo urbano con bordado frontal y cierre ajustable snapback. Talla unica.',
    price: 38000,
    images: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600'],
    category: 'Accesorios',
    tags: ['gorra', 'urbano', 'unisex'],
    variants: [{ type: 'Color', options: ['Negro', 'Beige', 'Blanco'] }],
    stock: 80,
    featured: false,
  },
  {
    slug: 'mochila-minimalista',
    name: 'Mochila Minimalista 20L',
    description: 'Mochila urbana de 20 litros con compartimento para portatil de 15 pulgadas. Diseno limpio y resistente al agua.',
    price: 95000,
    compareAtPrice: 130000,
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600'],
    category: 'Accesorios',
    tags: ['mochila', 'trabajo', 'viaje'],
    variants: [{ type: 'Color', options: ['Negro', 'Gris oscuro'] }],
    stock: 25,
    featured: true,
  },
  {
    slug: 'audifonos-inalambricos-pro',
    name: 'Audifonos Inalambricos Pro',
    description: 'Audifonos Bluetooth 5.3 con cancelacion de ruido activa, 30h de bateria y estuche de carga incluido.',
    price: 189000,
    compareAtPrice: 250000,
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
    category: 'Tecnologia',
    tags: ['audifonos', 'bluetooth', 'musica'],
    variants: [{ type: 'Color', options: ['Negro', 'Blanco', 'Azul'] }],
    stock: 15,
    featured: true,
  },
  {
    slug: 'soporte-celular-escritorio',
    name: 'Soporte de Escritorio para Celular',
    description: 'Soporte ajustable de aluminio compatible con todos los smartphones.',
    price: 28000,
    images: ['https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=600'],
    category: 'Tecnologia',
    tags: ['accesorios-tech', 'escritorio', 'productividad'],
    variants: [],
    stock: 100,
    featured: false,
  },
  {
    slug: 'lampara-led-ambiente',
    name: 'Lampara LED de Ambiente',
    description: 'Lampara tactil recargable con 3 niveles de iluminacion. Perfecta para escritorio o mesa de noche.',
    price: 55000,
    compareAtPrice: 75000,
    images: ['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'],
    category: 'Hogar',
    tags: ['lampara', 'decoracion', 'led'],
    variants: [{ type: 'Color', options: ['Blanco', 'Madera natural'] }],
    stock: 40,
    featured: true,
  },
  {
    slug: 'organizador-escritorio-bambu',
    name: 'Organizador de Escritorio en Bambu',
    description: 'Set organizador de 5 piezas en bambu natural. Incluye porta-lapices, bandeja y separadores.',
    price: 72000,
    images: ['https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600'],
    category: 'Hogar',
    tags: ['organizador', 'bambu', 'minimalista'],
    variants: [],
    stock: 20,
    featured: false,
  },
  {
    slug: 'difusor-aromas-ultrasonico',
    name: 'Difusor de Aromas Ultrasonico',
    description: 'Difusor de aceites esenciales con luz LED multicolor, temporizador y apagado automatico. 300ml.',
    price: 68000,
    compareAtPrice: 90000,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600'],
    category: 'Hogar',
    tags: ['aromaterapia', 'bienestar', 'hogar'],
    variants: [{ type: 'Color', options: ['Blanco', 'Negro'] }],
    stock: 35,
    featured: true,
  },
  {
    slug: 'rinonera-urbana',
    name: 'Rinonera Urbana',
    description: 'Rinonera de tela resistente con compartimentos organizados. Se usa en cintura o cruzada al pecho.',
    price: 42000,
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600'],
    category: 'Accesorios',
    tags: ['rinonera', 'urbano', 'festival'],
    variants: [{ type: 'Color', options: ['Negro', 'Caqui', 'Azul'] }],
    stock: 60,
    featured: false,
  },
]

async function main() {
  console.log('Iniciando seed de la base de datos...')
  await prisma.product.deleteMany()
  for (const product of seedProducts) {
    await prisma.product.create({ data: product })
  }
  console.log(`Se insertaron ${seedProducts.length} productos correctamente.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
