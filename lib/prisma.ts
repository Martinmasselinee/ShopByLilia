import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// CRITICAL: Configure Prisma for Supabase Transaction Pooler (port 6543)
// Your DATABASE_URL should already include: port 6543 + ?pgbouncer=true
// Reference: https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Use DATABASE_URL as-is (already configured correctly for Supabase Transaction Pooler)
})

// In production (Vercel), always reuse the Prisma client to avoid connection issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

