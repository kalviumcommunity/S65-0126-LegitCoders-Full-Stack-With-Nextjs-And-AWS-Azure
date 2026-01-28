import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = globalForRedis.redis ?? new Redis(
  process.env.REDIS_URL || 'redis://localhost:6379',
  {
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      const delay = Math.min(times * 50, 2000)
      return delay
    },
    lazyConnect: true, // Don't connect immediately during build
    enableOfflineQueue: false,
  }
)

// Suppress connection errors during build time
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  redis.on('error', (err) => {
    // Silently handle Redis connection errors during build/development
    if (!err.message.includes('ECONNREFUSED')) {
      console.error('Redis error:', err)
    }
  })
}

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Helper functions for caching
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch (error) {
    console.error('Redis get error:', error)
    return null
  }
}

export const cacheSet = async <T>(
  key: string,
  value: T,
  expirationInSeconds?: number
): Promise<void> => {
  try {
    const serialized = JSON.stringify(value)
    if (expirationInSeconds) {
      await redis.setex(key, expirationInSeconds, serialized)
    } else {
      await redis.set(key, serialized)
    }
  } catch (error) {
    console.error('Redis set error:', error)
  }
}

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redis.del(key)
  } catch (error) {
    console.error('Redis delete error:', error)
  }
}

export default redis
