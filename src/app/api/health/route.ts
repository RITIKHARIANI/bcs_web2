import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check environment
    const environment = process.env.NODE_ENV || 'development'
    const isVercel = !!process.env.VERCEL
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment,
      platform: isVercel ? 'vercel' : 'local',
      database: 'connected',
      version: '2.0.0',
      features: {
        authentication: true,
        richTextEditor: process.env.NEXT_PUBLIC_ENABLE_RICH_TEXT_EDITOR === 'true',
        graphVisualization: process.env.NEXT_PUBLIC_ENABLE_GRAPH_VISUALIZATION === 'true',
        analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
      }
    }, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      environment: process.env.NODE_ENV || 'development'
    }, { status: 503 })
  }
}

export async function HEAD(request: NextRequest) {
  // Simple health check for monitoring services
  try {
    await prisma.$queryRaw`SELECT 1`
    return new Response(null, { status: 200 })
  } catch {
    return new Response(null, { status: 503 })
  }
}
