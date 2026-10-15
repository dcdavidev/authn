/**
 * @file Main API router aggregating all route handlers.
 * @module routes
 */

import { Router } from 'express';

import { rootController } from '../controllers/index.js';

/**
 * Root application router.
 */
export const rootRouter: Router = Router();

/**
 * GET /
 * Root service metadata endpoint.
 */
rootRouter.get('/', rootController.getRoot);
