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
rootRouter.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    service: req.app.get('serviceName') ?? '@authn/accounts-api',
    status: 'online',
    health: '/health',
  });
});
