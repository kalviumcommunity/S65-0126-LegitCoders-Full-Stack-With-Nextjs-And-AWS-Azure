import { NextApiRequest, NextApiResponse } from 'next';

export type NextApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse
) => void | Promise<void>;

export type MiddlewareFunction = (handler: NextApiHandler) => NextApiHandler;

/**
 * Compose multiple middleware functions
 */
export function composeMiddleware(...middlewares: MiddlewareFunction[]) {
  return (handler: NextApiHandler): NextApiHandler => {
    let composed = handler;
    // Apply middlewares in reverse order so the first one in the array wraps last
    for (let i = middlewares.length - 1; i >= 0; i--) {
      composed = middlewares[i](composed);
    }
    return composed;
  };
}

export default composeMiddleware;
