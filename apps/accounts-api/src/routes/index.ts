/**
 * @file Main API router aggregating all route handlers.
 * @module routes
 */

import { type Request, type Response, Router } from 'express';

import { healthRouter } from './health.js';

/**
 * Root application router.
 */
export const rootRouter: Router = Router();

/**
 * Mount health check routes under /health.
 */
rootRouter.use('/health', healthRouter);

/**
 * GET /
 * Root service metadata endpoint.
 */
rootRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    service: '@authn/accounts-api',
    status: 'online',
    documentation: '/docs',
    health: '/health',
  });
});

export { healthRouter } from './health.js';
