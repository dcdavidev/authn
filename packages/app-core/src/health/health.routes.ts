/**
 * @file Health check routes (View layer) exposing HTTP endpoints.
 * @module health/health.routes
 */

import { Router } from 'express';

import { HealthController } from './health.controller.js';
import { healthModel as defaultHealthModel } from './health.model.js';
import type { HealthCheckOptions } from './health.types.js';

/**
 * Creates an Express router dedicated to health check endpoints.
 *
 * @param [options] - Health check configuration options.
 * @returns Configured health router instance.
 */
export function createHealthRouter(options?: HealthCheckOptions): Router {
  const router: Router = Router();
  const model = defaultHealthModel;

  if (options?.plugins) {
    for (const plugin of options.plugins) {
      model.registerPlugin(plugin);
    }
  }

  const controller = new HealthController(model);

  router.get('/', controller.getHealth);
  router.get('/live', controller.getLiveness);
  router.get('/ready', controller.getReadiness);

  return router;
}

/**
 * Default singleton instance of the health router.
 */
export const healthRouter: Router = createHealthRouter();
