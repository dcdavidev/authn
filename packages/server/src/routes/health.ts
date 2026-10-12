/**
 * @file Health check routes for monitoring and container orchestration (liveness / readiness).
 * @module routes/health
 */

import { type Request, type Response, Router } from 'express';

import { config } from '../config/env.js';

/**
 * Options for configuring health check endpoints.
 */
export interface HealthRouterOptions {
  /** Service or application name */
  serviceName?: string;
  /** Service version string */
  version?: string;
  /** Custom environment identifier */
  environment?: string;
  /** Asynchronous or synchronous probe returning whether the service is ready */
  isReady?: () => Promise<boolean> | boolean;
  /** Additional diagnostic data to append to the root /health response */
  extraInfo?:
    | Record<string, unknown>
    | (() => Promise<Record<string, unknown>> | Record<string, unknown>);
}

/**
 * Creates an Express router dedicated to health check endpoints.
 *
 * @param [options] - Optional health check configuration.
 * @returns Configured health router.
 */
export function createHealthRouter(options?: HealthRouterOptions): Router {
  const router: Router = Router();

  /**
   * GET /
   * Returns service status, uptime, and runtime environment.
   */
  router.get('/', async (_req: Request, res: Response) => {
    let extraData: Record<string, unknown> = {};
    if (typeof options?.extraInfo === 'function') {
      try {
        extraData = await options.extraInfo();
      } catch {
        extraData = { extraInfoError: 'Failed to retrieve diagnostics' };
      }
    } else if (options?.extraInfo) {
      extraData = options.extraInfo;
    }

    res.status(200).json({
      status: 'ok',
      service: options?.serviceName ?? config.serviceName,
      ...(options?.version ? { version: options.version } : {}),
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      environment: options?.environment ?? config.nodeEnv,
      ...extraData,
    });
  });

  /**
   * GET /live
   * Kubernetes liveness probe endpoint.
   */
  router.get('/live', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'alive' });
  });

  /**
   * GET /ready
   * Kubernetes readiness probe endpoint.
   */
  router.get('/ready', async (_req: Request, res: Response) => {
    if (options?.isReady) {
      try {
        const ready = await options.isReady();
        if (!ready) {
          res.status(503).json({ status: 'not_ready' });
          return;
        }
      } catch {
        res.status(503).json({ status: 'not_ready' });
        return;
      }
    }

    res.status(200).json({ status: 'ready' });
  });

  return router;
}

/**
 * Default health router instance using standard settings.
 */
export const healthRouter: Router = createHealthRouter();
