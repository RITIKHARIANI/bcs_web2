import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  // Configure connection pool for serverless
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // Add transaction timeout and other connection settings
  transactionOptions: {
    timeout: 10000, // 10 seconds timeout
  },
  // Disable connection pooling in serverless to prevent conflicts
  datasources: {
    db: {
      url: process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL
    }
  },
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Graceful shutdown for serverless environments
if (typeof window === 'undefined') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect()
  })
}
