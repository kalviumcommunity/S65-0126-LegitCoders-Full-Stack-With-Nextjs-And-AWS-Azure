import { NextApiRequest, NextApiResponse } from 'next';
import { createDistrict, getAllDistricts } from '@controllers/district';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';
import { DistrictCreateSchema } from '@utils/schema';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      return getAllDistricts(req, res);
    }

    if (req.method === 'POST') {
      const validated = DistrictCreateSchema.parse(req.body);
      req.body = validated;
      return createDistrict(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
