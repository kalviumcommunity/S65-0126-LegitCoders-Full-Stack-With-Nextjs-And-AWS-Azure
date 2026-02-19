import { createClient } from 'redis';
import config from './env';
import logger from '@utils/logger';

let redisClient: ReturnType<typeof createClient> | null = null;
let redisAvailable = false;

export async function initializeRedis() {
  try {
    const client = createClient({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      database: config.redis.db,
      socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 500),
      },
    });

    client.on('error', (err) => {
      logger.warn('Redis Connection Error - running without cache', err);
      redisAvailable = false;
    });
    client.on('connect', () => {
      logger.info('Redis Client Connected');
      redisAvailable = true;
    });

    await client.connect();
    redisClient = client;
    redisAvailable = true;
    return client;
  } catch (error) {
    logger.warn('Redis initialization failed - running without cache', error);
    redisAvailable = false;
    return null;
  }
}

export function getRedisClient() {
  return redisClient; // Can be null if Redis unavailable
}

export function isRedisAvailable() {
  return redisAvailable && redisClient !== null;
}

export async function closeRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    redisAvailable = false;
  }
}

export default {
  initializeRedis,
  getRedisClient,
  isRedisAvailable,
  closeRedis,
};
