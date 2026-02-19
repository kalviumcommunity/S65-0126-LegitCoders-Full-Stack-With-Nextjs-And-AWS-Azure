import { NextApiRequest, NextApiResponse } from 'next';
import { healthCheck, systemStatus } from '@controllers/health';
import { withErrorHandler } from '@middleware/errorHandler';
import { withLogger } from '@middleware/logger';
import { composeMiddleware } from '@middleware/compose';

const handler = composeMiddleware(withLogger, withErrorHandler)(
  async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method === 'GET') {
      // Simple health check or detailed status
      const detailed = req.query.detailed === 'true';

      if (detailed) {
        return systemStatus(req, res);
      }

      return healthCheck(req, res);
    }

    res.status(405).json({ error: 'Method not allowed' });
  }
);

export default handler;
