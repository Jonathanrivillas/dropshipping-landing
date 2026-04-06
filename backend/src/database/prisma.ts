import { PrismaClient } from '@prisma/client'

/**
 * Patrón singleton para PrismaClient.
 * En desarrollo (hot-reload), Node puede re-evaluar módulos y crear múltiples
 * instancias que agotan el pool de conexiones de PostgreSQL.
 * Almacenar la instancia en `globalThis` garantiza que solo exista una.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
