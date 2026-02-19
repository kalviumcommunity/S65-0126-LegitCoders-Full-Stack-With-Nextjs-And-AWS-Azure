import { NextApiRequest, NextApiResponse } from 'next';
import { deactivateAlert } from '@controllers/alert';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { withRateLimit } from '@middleware/rateLimit';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withRateLimit, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'PATCH') {
      return deactivateAlert(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
