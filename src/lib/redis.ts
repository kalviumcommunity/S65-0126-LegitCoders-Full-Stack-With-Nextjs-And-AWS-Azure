import Redis from 'ioredis'

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

// Create Redis instance with lazy connect for build compatibility
const createRedisClient = () => {
  const client = new Redis(
    process.env.REDIS_URL || 'redis://localhost:6379',
    {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
      enableOfflineQueue: false,
    }
  )

  // Handle connection errors gracefully
  client.on('error', (err) => {
    // Only log non-connection errors to avoid noise during development
    if (!err.message.includes('ECONNREFUSED') && !err.message.includes('ENOTFOUND')) {
      console.error('Redis error:', err)
    }
  })

  return client
}

export const redis = globalForRedis.redis ?? createRedisClient()

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}

// Helper to ensure connection before operations
const ensureConnection = async () => {
  if (redis.status !== 'ready') {
    try {
      await redis.connect()
    } catch {
      // Connection failed, operations will handle gracefully
    }
  }
}

// Helper functions for caching
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  try {
    await ensureConnection()
    const data = await redis.get(key)
    return data ? JSON.parse(data) : null
  } catch {
    // Silently fail for caching - app should work without cache
    return null
  }
}

export const cacheSet = async <T>(
  key: string,
  value: T,
  expirationInSeconds?: number
): Promise<void> => {
  try {
    await ensureConnection()
    const serialized = JSON.stringify(value)
    if (expirationInSeconds) {
      await redis.setex(key, expirationInSeconds, serialized)
    } else {
      await redis.set(key, serialized)
    }
  } catch {
    // Silently fail for caching - app should work without cache
  }
}

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await ensureConnection()
    await redis.del(key)
  } catch {
    // Silently fail for caching - app should work without cache
  }
}

export default redis
