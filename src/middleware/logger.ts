import { NextApiRequest, NextApiResponse } from 'next';
import logger from '@utils/logger';

/**
 * Request logging middleware
 */
export function withLogger(handler: any): any {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const startTime = Date.now();
    const { method, url, query, body } = req;

    // Log request
    logger.info(`Incoming ${method} ${url}`, {
      method,
      url,
      query,
      // Only log body for non-sensitive endpoints
      body: method !== 'GET' ? body : undefined,
    });

    // Log response
    const originalJson = res.json.bind(res);
    res.json = function (data) {
      const duration = Date.now() - startTime;
      logger.info(`Outgoing ${method} ${url}`, {
        statusCode: res.statusCode,
        duration: `${duration}ms`,
      });
      return originalJson(data);
    };

    return handler(req, res);
  };
}

export default withLogger;
