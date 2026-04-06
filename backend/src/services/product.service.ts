import prisma from '../database/prisma'

export const getAllProducts = async (filters: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) => {
  const { category, search, page = 1, limit = 12 } = filters
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (category) where.category = { equals: category, mode: 'insensitive' }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ])

  return { products, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export const getProductById = async (id: string) => {
  return prisma.product.findUnique({ where: { id } })
}

// Búsqueda por slug: permite URLs legibles como /producto/camiseta-oversize-negra
export const getProductBySlug = async (slug: string) => {
  return prisma.product.findUnique({ where: { slug } })
}

export const createProduct = async (data: {
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice?: number
  images: string[]
  category: string
  tags: string[]
  variants: object[]
  stock: number
  featured: boolean
}) => {
  return prisma.product.create({ data })
}

export const updateProduct = async (id: string, data: Partial<{
  slug: string
  name: string
  description: string
  price: number
  compareAtPrice: number | null
  images: string[]
  category: string
  tags: string[]
  variants: object[]
  stock: number
  featured: boolean
}>) => {
  return prisma.product.update({ where: { id }, data })
}

export const deleteProduct = async (id: string) => {
  return prisma.product.delete({ where: { id } })
}
