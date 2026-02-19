import { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchAndStoreWeather,
  getLatestWeather,
  getWeatherRange,
  getRainfallAccumulation,
} from '@controllers/weather';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      // Check which endpoint is being called
      const action = req.query.action as string;

      if (action === 'latest') {
        return getLatestWeather(req, res);
      }

      if (action === 'range') {
        return getWeatherRange(req, res);
      }

      if (action === 'accumulation') {
        return getRainfallAccumulation(req, res);
      }

      // Default: fetch and store
      return fetchAndStoreWeather(req, res);
    }

    if (req.method === 'POST') {
      return fetchAndStoreWeather(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
