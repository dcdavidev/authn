/**
 * @file Main API router aggregating all route handlers.
 * @module routes
 */

import { type Request, type Response, Router } from 'express';

/**
 * Root application router.
 */
export const rootRouter: Router = Router();

/**
 * GET /
 * Root service metadata endpoint.
 */
rootRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: '@authn/accounts-server',
    status: 'online',
    documentation: '/docs',
  });
});
