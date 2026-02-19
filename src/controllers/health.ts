import { NextApiRequest, NextApiResponse } from 'next';
import { sendSuccess } from '@utils/response';
import { prisma } from '@config/database';
import { getRedisClient, isRedisAvailable } from '@config/redis';
import logger from '@utils/logger';

export async function healthCheck(req: NextApiRequest, res: NextApiResponse) {
  try {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'checking...',
      redis: 'checking...',
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.database = 'connected';
    } catch (error) {
      checks.database = 'disconnected';
      logger.warn('Database health check failed:', error);
    }

    // Check Redis connection
    try {
      if (isRedisAvailable()) {
        const redis = getRedisClient();
        if (redis) {
          await redis.ping();
          checks.redis = 'connected';
        } else {
          checks.redis = 'disconnected';
        }
      } else {
        checks.redis = 'unavailable';
        logger.warn('Redis not available (optional for development)');
      }
    } catch (error) {
      checks.redis = 'disconnected';
      logger.warn('Redis health check failed:', error);
    }

    // Server is healthy if database is connected (Redis is optional)
    const isHealthy = checks.database === 'connected';

    return sendSuccess(
      res,
      checks,
      'Health check completed',
      isHealthy ? 200 : 503
    );
  } catch (error: any) {
    logger.error('Health check error:', error);
    return sendSuccess(
      res,
      { status: 'error', error: error.message },
      'Health check failed',
      503
    );
  }
}

export async function systemStatus(req: NextApiRequest, res: NextApiResponse) {
  try {
    const stats = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    };

    return sendSuccess(res, stats, 'System status retrieved successfully');
  } catch (error: any) {
    logger.error('System status error:', error);
    throw error;
  }
}
