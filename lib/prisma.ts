import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// CRITICAL: Configure Prisma for Supabase Transaction Pooler (port 6543)
// Reference: https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL + (
        // Add ?pgbouncer=true if not already present (required for port 6543)
        process.env.DATABASE_URL?.includes('?pgbouncer=true') 
          ? '' 
          : '?pgbouncer=true&connection_limit=1&pool_timeout=30&connect_timeout=30'
      ),
    },
  },
})

// In production (Vercel), reuse the Prisma client to avoid connection issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
} else {
  // For production, also cache the client to reuse connections
  globalForPrisma.prisma = prisma
}

