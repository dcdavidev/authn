/**
 * @file Express application factory and middleware configuration.
 * @module app
 */

import type {
  ErrorRequestHandler,
  Express,
  RequestHandler,
  Router,
} from 'express';
import express from 'express';

import type { CorsOptions } from 'cors';
import type helmet from 'helmet';

import type hpp from 'hpp';
import type { Logger } from 'pino';

import { type ServerConfig } from './config/env.js';
import { logger as defaultLogger } from './logger/logger.js';
import { createBodyParserMiddlewares } from './middlewares/body-parser.js';
import {
  createErrorHandler,
  notFoundHandler as defaultNotFoundHandler,
} from './middlewares/error-handler.js';
import {
  createRateLimiter,
  type RateLimitOptions,
} from './middlewares/rate-limiter.js';
import {
  createCorsMiddleware,
  createHelmetMiddleware,
  createHppMiddleware,
} from './middlewares/security.js';
import {
  createHealthRouter,
  type HealthRouterOptions,
} from './routes/health.js';

/**
 * Options to customize the Express application creation.
 */
export interface CreateAppOptions {
  /** Optional server configuration instance */
  config?: ServerConfig;
  /** Service name identifier */
  serviceName?: string;
  /** Custom logger instance */
  logger?: Logger;
  /** Trust proxy configuration (e.g. 1 for single proxy, true, or IP list; default: 1) */
  trustProxy?: boolean | number | string;
  /** Whether to disable the 'x-powered-by' header (default: true) */
  disableXPoweredBy?: boolean;
  /** Whether to enable Helmet security headers middleware (default: true) */
  enableHelmet?: boolean;
  /** Custom options for Helmet middleware */
  helmetOptions?: Parameters<typeof helmet>[0];
  /** Whether to enable Cross-Origin Resource Sharing (default: true) */
  enableCors?: boolean;
  /** Custom options for CORS middleware */
  corsOptions?: CorsOptions;
  /** Whether to enable JSON and URL-encoded body parsers (default: true) */
  enableBodyParser?: boolean;
  /** Payload limit for body parsers (e.g. '1mb', '5mb') */
  bodyLimit?: string;
  /** Whether to enable HTTP Parameter Pollution protection (default: true) */
  enableHpp?: boolean;
  /** Custom options for HPP middleware */
  hppOptions?: Parameters<typeof hpp>[0];
  /** Whether to enable IP rate limiting (default: true) */
  enableRateLimit?: boolean;
  /** Custom options for rate limiter */
  rateLimitOptions?: Partial<RateLimitOptions>;
  /** Whether to automatically mount health check endpoints (default: true) */
  enableHealthCheck?: boolean;
  /** Mount path for health check endpoints (default: '/health') */
  healthPath?: string;
  /** Health check router configuration options */
  healthOptions?: HealthRouterOptions;
  /** Application routes or Router to mount */
  routes?: Router | RequestHandler | ((app: Express) => void);
  /** Callback allowing additional custom middleware or route registration */
  configure?: (app: Express) => void;
  /** Custom 404 Not Found fallback handler */
  notFoundHandler?: RequestHandler;
  /** Custom centralized error handling middleware */
  errorHandler?: ErrorRequestHandler;
}

/**
 * Creates and configures a new Express application instance with security,
 * body parsing, rate limiting, health checks, and error handling.
 *
 * @param [options] - Configuration options for the Express application.
 * @returns Fully configured Express application instance.
 */
export function createApp(options?: CreateAppOptions): Express {
  const app: Express = express();
  const activeLogger = options?.logger ?? defaultLogger;

  // Configure reverse proxy trust
  if (options?.trustProxy === undefined) {
    app.set('trust proxy', 1);
  } else {
    app.set('trust proxy', options.trustProxy);
  }

  // Disable x-powered-by header
  if (options?.disableXPoweredBy !== false) {
    app.disable('x-powered-by');
  }

  // Security headers with Helmet
  if (options?.enableHelmet !== false) {
    app.use(createHelmetMiddleware(options?.helmetOptions));
  }

  // CORS configuration
  if (options?.enableCors !== false) {
    app.use(createCorsMiddleware(options?.corsOptions));
  }

  // Request body parsing
  if (options?.enableBodyParser !== false) {
    for (const middleware of createBodyParserMiddlewares(options?.bodyLimit)) {
      app.use(middleware);
    }
  }

  // HTTP Parameter Pollution protection
  if (options?.enableHpp !== false) {
    app.use(createHppMiddleware(options?.hppOptions));
  }

  // Rate limiting
  if (options?.enableRateLimit !== false) {
    app.use(createRateLimiter(options?.rateLimitOptions));
  }

  // Health check endpoints
  if (options?.enableHealthCheck !== false) {
    const healthPath = options?.healthPath ?? '/health';
    const healthOptions: HealthRouterOptions = {
      serviceName: options?.serviceName,
      ...options?.healthOptions,
    };
    app.use(healthPath, createHealthRouter(healthOptions));
  }

  // Custom routes mounting
  if (typeof options?.routes === 'function') {
    // If it's a configuration function with (app: Express) => void
    if (options.routes.length === 1) {
      (options.routes as (app: Express) => void)(app);
    } else {
      app.use(options.routes as RequestHandler);
    }
  } else if (options?.routes) {
    app.use(options.routes);
  }

  // Custom setup callback
  if (options?.configure) {
    options.configure(app);
  }

  // 404 Not Found fallback handler
  if (options?.notFoundHandler === undefined) {
    app.use(defaultNotFoundHandler);
  } else {
    app.use(options.notFoundHandler);
  }

  // Centralized error handling
  if (options?.errorHandler === undefined) {
    app.use(createErrorHandler({ logger: activeLogger }));
  } else {
    app.use(options.errorHandler);
  }

  return app;
}
