import { NextApiRequest, NextApiResponse } from 'next';
import {
  calculateAndStoreRisk,
  getRiskAssessment,
  getRiskHistory,
  getRiskForAllDistricts,
} from '@controllers/risk';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      const { districtId, action } = req.query;

      // If no districtId, return risks for all districts
      if (!districtId) {
        return getRiskForAllDistricts(req, res);
      }

      if (action === 'history') {
        return getRiskHistory(req, res);
      }

      // Default: get latest assessment
      return getRiskAssessment(req, res);
    }

    if (req.method === 'POST') {
      return calculateAndStoreRisk(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
