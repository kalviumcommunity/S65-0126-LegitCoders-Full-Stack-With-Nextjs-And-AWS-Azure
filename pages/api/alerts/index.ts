import { NextApiRequest, NextApiResponse } from 'next';
import {
  getActiveAlerts,
  getAlertsByDistrict,
  getCriticalAlertsCount,
} from '@controllers/alert';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      const { districtId, action } = req.query;

      if (action === 'count') {
        return getCriticalAlertsCount(req, res);
      }

      if (districtId) {
        return getAlertsByDistrict(req, res);
      }

      return getActiveAlerts(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
