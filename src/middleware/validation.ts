import { NextApiRequest, NextApiResponse } from 'next';
import { ZodSchema } from 'zod';
import { ValidationError } from '@utils/errors';
import logger from '@utils/logger';

interface ValidationOptions {
  body?: ZodSchema;
  query?: ZodSchema;
  method?: string | string[];
}

/**
 * Validation middleware using Zod
 */
export function withValidation(
  handler: any,
  options: ValidationOptions
): any {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const { method = req.method, body, query } = options;

      // Check allowed methods
      if (method && req.method !== method && !Array.isArray(method)) {
        throw new ValidationError(`Method ${req.method} not allowed`);
      }

      if (Array.isArray(method) && !method.includes(req.method!)) {
        throw new ValidationError(`Method ${req.method} not allowed`);
      }

      // Validate body
      if (body && req.body) {
        try {
          req.body = body.parse(req.body);
        } catch (error: any) {
          throw new ValidationError(
            `Body validation failed: ${error.errors.map((e: any) => e.message).join(', ')}`
          );
        }
      }

      // Validate query
      if (query && req.query) {
        try {
          req.query = query.parse(req.query);
        } catch (error: any) {
          throw new ValidationError(
            `Query validation failed: ${error.errors.map((e: any) => e.message).join(', ')}`
          );
        }
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Validation error:', error);
      throw error;
    }
  };
}

export default withValidation;
