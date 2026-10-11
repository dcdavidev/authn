/**
 * @file Express application factory and middleware configuration.
 * @module app
 */

import express, { type Express } from 'express';

import {
  bodyParserMiddlewares,
  corsMiddleware,
  errorHandler,
  helmetMiddleware,
  hppMiddleware,
  notFoundHandler,
  rateLimiter,
} from './middlewares/index.js';
import { rootRouter } from './routes/index.js';

/**
 * Creates and configures a new Express application instance.
 *
 * Sets up security headers, CORS, body parsing, parameter pollution protection,
 * rate limiting, application routes, and centralized error handling.
 *
 * @returns Fully configured Express application instance.
 */
export function createApp(): Express {
  const app: Express = express();

  // Trust first proxy if behind reverse proxy / load balancer (e.g. Nginx, Cloudflare, AWS ALB)
  app.set('trust proxy', 1);

  // Disable x-powered-by header
  app.disable('x-powered-by');

  // 1. Security headers with Helmet
  app.use(helmetMiddleware);

  // 2. CORS configuration
  app.use(corsMiddleware);

  // 3. Request body parsing
  app.use(bodyParserMiddlewares);

  // 4. HTTP Parameter Pollution protection
  app.use(hppMiddleware);

  // 5. Rate limiting
  app.use(rateLimiter);

  // 6. Application routes
  app.use(rootRouter);

  // 7. 404 Not Found fallback handler
  app.use(notFoundHandler);

  // 8. Centralized error handling
  app.use(errorHandler);

  return app;
}
