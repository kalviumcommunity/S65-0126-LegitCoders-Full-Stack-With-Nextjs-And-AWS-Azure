import { NextApiRequest, NextApiResponse } from 'next';
import { getDistrict, updateDistrict, deleteDistrict } from '@controllers/district';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      return getDistrict(req, res);
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      return updateDistrict(req, res);
    }

    if (req.method === 'DELETE') {
      return deleteDistrict(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
