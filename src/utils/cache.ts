import { getRedisClient } from '@config/redis';
import logger from './logger';

export class CacheManager {
  private redis = getRedisClient();
  private defaultTtl: number = 600; // 10 minutes

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.redis) return null;
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.warn(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      if (!this.redis) return false;
      const serialized = JSON.stringify(value);
      const expiry = ttl || this.defaultTtl;
      await this.redis.setEx(key, expiry, serialized);
      return true;
    } catch (error) {
      logger.warn(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<boolean> {
    try {
      if (!this.redis) return false;
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      logger.warn(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<boolean> {
    try {
      if (!this.redis) return false;
      await this.redis.flushDb();
      return true;
    } catch (error) {
      logger.warn('Cache clear error:', error);
      return false;
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.redis) return false;
      const result = await this.redis.exists(key);
      return result > 0;
    } catch (error) {
      logger.warn(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get or set (lazy loading)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    try {
      if (this.redis) {
        const cached = await this.get<T>(key);
        if (cached) {
          logger.debug(`Cache hit for key ${key}`);
          return cached;
        }
      }

      logger.debug(`Cache miss for key ${key}, fetching fresh data`);
      const fresh = await fetcher();
      if (this.redis) {
        await this.set(key, fresh, ttl);
      }
      return fresh;
    } catch (error) {
      logger.error(`Cache getOrSet error for key ${key}:`, error);
      throw error;
    }
  }
}

export const cacheManager = new CacheManager();
export default cacheManager;
