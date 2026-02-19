import { NextApiRequest, NextApiResponse } from 'next';
import { getRedisClient, isRedisAvailable } from '@config/redis';
import config from '@config/env';
import { sendError } from '@utils/response';
import logger from '@utils/logger';

interface RateLimitOptions {
  windowMs?: number;
  maxRequests?: number;
  keyGenerator?: (req: NextApiRequest) => string;
}

/**
 * Rate limiting middleware using Redis
 * Falls back to no rate limiting if Redis is unavailable
 */
export function withRateLimit(
  handler: any,
  options: RateLimitOptions = {}
): any {
  const windowMs = options.windowMs || config.rate_limit.window_ms;
  const maxRequests = options.maxRequests || config.rate_limit.max_requests;
  const keyGenerator =
    options.keyGenerator || ((req) => req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown');

  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Skip rate limiting if Redis is not available
      if (!isRedisAvailable()) {
        logger.debug('Redis unavailable, skipping rate limiting');
        return handler(req, res);
      }

      const redis = getRedisClient();
      if (!redis) {
        return handler(req, res);
      }

      const key = `rate-limit:${keyGenerator(req)}`;
      const current = await redis.incr(key);

      if (current === 1) {
        // Set expiry only on first request
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - current).toString());
      res.setHeader(
        'X-RateLimit-Reset',
        (Date.now() + windowMs).toString()
      );

      if (current > maxRequests) {
        logger.warn(`Rate limit exceeded for ${key}`);
        return sendError(
          res,
          'Too many requests. Please try again later.',
          429,
          'RATE_LIMIT_EXCEEDED'
        );
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // If Redis fails, allow request to proceed
      return handler(req, res);
    }
  };
}

export default withRateLimit;
