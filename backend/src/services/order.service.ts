import { Prisma } from '@prisma/client'
import prisma from '../database/prisma'
import { sendOrderConfirmationEmail } from './email.service'

// Genera un número de orden único en el servidor.
// El formato es ORD-AÑO-RANDOM6 — nunca se genera en el frontend.
function generateOrderNumber(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 1_000_000).toString().padStart(6, '0')
  return `ORD-${year}-${random}`
}

interface OrderItemInput {
  productId: string
  quantity: number
}

interface CustomerInfo {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  department: string
}

export const createOrder = async (data: {
  customer: CustomerInfo
  items: OrderItemInput[]
  paymentMethod: string
}) => {
  const { customer, items, paymentMethod } = data
  const orderNumber = generateOrderNumber()

  // Transacción serializable: valida stock y precio desde la BD de forma atómica.
  // Serializable evita race conditions donde dos requests concurrentes pasen la
  // validación de stock simultáneamente antes de decrementar.
  const order = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // Obtener todos los productos en una sola query
      const productIds = items.map((i) => i.productId)
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      })

      const productMap = new Map(products.map((p) => [p.id, p]))

      // Validar existencia, stock y calcular total con precios de la BD
      let total = 0
      for (const item of items) {
        const product = productMap.get(item.productId)
        if (!product) throw new Error(`Producto con ID ${item.productId} no encontrado.`)
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto "${product.name}".`)
        }
        total += product.price * item.quantity
      }

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customer: customer as object,
          paymentMethod,
          total,
          status: 'PENDING',
          orderItems: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: productMap.get(item.productId)!.price, // precio desde BD
            })),
          },
        },
        include: { orderItems: { include: { product: true } } },
      })

      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        })
      }

      return newOrder
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  )

  return order
}

export const getOrderById = async (id: string) => {
  return prisma.order.findUnique({
    where: { id },
    include: { orderItems: { include: { product: true } } },
  })
}

// Búsqueda por orderNumber: permite consultar con el código "ORD-2026-123456"
export const getOrderByOrderNumber = async (orderNumber: string) => {
  return prisma.order.findUnique({
    where: { orderNumber },
    include: { orderItems: { include: { product: true } } },
  })
}

export const getAllOrders = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: { orderItems: true },
    }),
    prisma.order.count(),
  ])
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) }
}

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

// Transiciones permitidas: solo se puede avanzar, nunca retroceder
const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING:    ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED:    ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
}

function assertValidTransition(from: string, to: string) {
  const allowed = VALID_TRANSITIONS[from]
  if (!allowed) throw new Error(`Estado actual desconocido: ${from}`)
  if (!allowed.includes(to)) {
    throw new Error(`No se puede pasar de ${from} a ${to}`)
  }
}

export const updateOrderStatus = async (id: string, status: string) => {
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido')
  const order = await prisma.order.findUnique({ where: { id } })
  if (!order) throw new Error('Orden no encontrada')
  assertValidTransition(order.status, status)
  return prisma.order.update({
    where: { id },
    data: { status },
    include: { orderItems: { include: { product: true } } },
  })
}

export const updateOrderStatusByOrderNumber = async (orderNumber: string, status: string) => {
  if (!VALID_STATUSES.includes(status)) throw new Error('Estado inválido')
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { orderItems: { include: { product: true } } },
  })
  if (!order) throw new Error('Orden no encontrada')
  assertValidTransition(order.status, status)
  const updated = await prisma.order.update({
    where: { orderNumber },
    data: { status },
  })

  // Enviar email de confirmación cuando el pago se aprueba (primera vez que pasa a PROCESSING)
  if (status === 'PROCESSING') {
    const customer = order.customer as {
      fullName: string
      email: string
    }
    sendOrderConfirmationEmail({
      orderNumber,
      customerName: customer.fullName,
      customerEmail: customer.email,
      total: order.total,
      items: order.orderItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    })
  }

  return updated
}

export const getMetrics = async () => {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  const [
    revenueAgg,
    totalOrders,
    totalProducts,
    outOfStockCount,
    ordersByStatusRaw,
    recentOrders,
    lowStockProducts,
    recentOrdersForRevenue,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.product.count({ where: { stock: 0 } }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 } },
      select: { id: true, name: true, stock: true, slug: true },
      orderBy: { stock: 'asc' },
    }),
    // Solo últimos 7 días — el índice en createdAt hace esto eficiente
    prisma.order.findMany({
      where: { status: { not: 'CANCELLED' }, createdAt: { gte: sevenDaysAgo } },
      select: { total: true, createdAt: true },
    }),
  ])

  const ordersByStatus = Object.fromEntries(
    ordersByStatusRaw.map((r) => [r.status, r._count._all])
  )

  // Revenue por día (últimos 7 días) — calculado en Node desde un dataset pequeño
  const now = new Date()
  const revenueByDay = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const revenue = recentOrdersForRevenue
      .filter((o) => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
      .reduce((sum, o) => sum + o.total, 0)
    return { date: dateStr, revenue }
  })

  // Top 5 productos por unidades vendidas — query SQL directa con JOIN
  const topProducts = await prisma.$queryRaw<
    Array<{ id: string; name: string; quantity: number; revenue: number }>
  >`
    SELECT
      oi.product_id  AS id,
      p.name,
      SUM(oi.quantity)::int              AS quantity,
      SUM(oi.price * oi.quantity)::float AS revenue
    FROM order_items oi
    JOIN orders  o ON oi.order_id   = o.id
    JOIN products p ON oi.product_id = p.id
    WHERE o.status != 'CANCELLED'
    GROUP BY oi.product_id, p.name
    ORDER BY quantity DESC
    LIMIT 5
  `

  return {
    totalRevenue: revenueAgg._sum.total ?? 0,
    totalOrders,
    totalProducts,
    outOfStockProducts: outOfStockCount,
    ordersByStatus,
    recentOrders,
    lowStockProducts,
    revenueByDay,
    topProducts,
  }
}
