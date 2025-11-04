import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// Test connection on startup
if (!globalForPrisma.prisma) {
  console.log('[PRISMA] Initializing Prisma client...')
  prisma.$connect()
    .then(() => {
      console.log('[PRISMA] Connected to database successfully')
    })
    .catch((error) => {
      console.error('[PRISMA] Failed to connect to database:', error)
    })
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

