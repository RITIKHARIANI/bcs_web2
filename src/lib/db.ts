import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Function to create serverless-optimized DATABASE_URL
function getServerlessOptimizedUrl(): string {
  const baseUrl = process.env.DATABASE_URL
  if (!baseUrl) {
    throw new Error('DATABASE_URL is not defined')
  }
  
  // Parse the URL to add serverless parameters
  const url = new URL(baseUrl)
  
  // Add parameters to prevent prepared statement conflicts in serverless
  url.searchParams.set('prepared', 'false')
  url.searchParams.set('connection_limit', '1')
  url.searchParams.set('sslmode', 'require')
  
  return url.toString()
}

// Create Prisma client with serverless-optimized URL
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: getServerlessOptimizedUrl()
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['error'] : []
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
