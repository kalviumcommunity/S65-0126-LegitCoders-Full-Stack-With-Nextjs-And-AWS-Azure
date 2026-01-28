import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import redis from '@/lib/redis'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    const dbStatus = 'connected'

    // Check Redis connection
    let redisStatus = 'disconnected'
    try {
      await redis.ping()
      redisStatus = 'connected'
    } catch (error) {
      console.error('Redis health check failed:', error)
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      },
      { status: 503 }
    )
  }
}
