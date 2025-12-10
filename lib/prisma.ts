import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Always cache the Prisma Client instance globally (both dev and production)
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}


