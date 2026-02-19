import { NextApiRequest, NextApiResponse } from 'next';
import { ApiError } from '@utils/errors';
import { sendError } from '@utils/response';
import logger from '@utils/logger';

export type NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

/**
 * Error handling middleware wrapper
 */
export function withErrorHandler(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      logger.error('Unhandled error:', error);

      if (error instanceof ApiError) {
        return sendError(res, error.message, error.statusCode, error.code);
      }

      if (error instanceof SyntaxError) {
        return sendError(res, 'Invalid JSON in request body', 400);
      }

      if (error instanceof Error) {
        return sendError(res, error.message, 500);
      }

      return sendError(res, 'An unknown error occurred', 500);
    }
  };
}

export default withErrorHandler;
