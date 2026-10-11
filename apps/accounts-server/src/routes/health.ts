/**
 * @file Health check routes for monitoring and container orchestration (liveness / readiness).
 * @module routes/health
 */

import { type Request, type Response, Router } from 'express';

import { config } from '../config/env.js';

/**
 * Express router dedicated to health check endpoints.
 */
export const healthRouter: Router = Router();

/**
 * GET /health
 * Returns service status, uptime, and runtime environment.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.nodeEnv,
  });
});

/**
 * GET /health/live
 * Kubernetes liveness probe endpoint.
 */
healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'alive' });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe endpoint.
 */
healthRouter.get('/ready', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ready' });
});
