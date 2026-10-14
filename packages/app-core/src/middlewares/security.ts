/**
 * @file Security-related middlewares including Helmet, CORS, and HPP.
 * @module middlewares/security
 */

import type { RequestHandler } from 'express';

import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';

import hpp from 'hpp';

import { config } from '../config/env.js';

/**
 * Creates a CORS configuration with default safe headers and configurable origin.
 *
 * @param [customOptions] - Optional custom CORS configuration options.
 * @returns Configured CORS options object.
 */
export function createCorsOptions(customOptions?: CorsOptions): CorsOptions {
  return {
    origin: config.corsOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'X-Request-Id',
    ],
    ...customOptions,
  };
}

/**
 * Default CORS configuration options.
 */
export const corsOptions: CorsOptions = createCorsOptions();

/**
 * Creates Cross-Origin Resource Sharing (CORS) middleware.
 *
 * @param [options] - Optional CORS configuration.
 * @returns Configured CORS RequestHandler.
 */
export function createCorsMiddleware(options?: CorsOptions): RequestHandler {
  return cors(createCorsOptions(options));
}

/**
 * Default Cross-Origin Resource Sharing (CORS) middleware instance.
 */
export const corsMiddleware: RequestHandler = createCorsMiddleware();

/**
 * Creates Helmet middleware to secure Express apps by setting various HTTP headers.
 *
 * @param [options] - Optional Helmet options.
 * @returns Configured Helmet RequestHandler.
 */
export function createHelmetMiddleware(
  options?: Parameters<typeof helmet>[0]
): RequestHandler {
  return helmet(options);
}

/**
 * Default Helmet middleware instance.
 */
export const helmetMiddleware: RequestHandler = createHelmetMiddleware();

/**
 * Creates HTTP Parameter Pollution (HPP) middleware to protect against parameter pollution attacks.
 *
 * @param [options] - Optional HPP options.
 * @returns Configured HPP RequestHandler.
 */
export function createHppMiddleware(
  options?: Parameters<typeof hpp>[0]
): RequestHandler {
  return hpp(options);
}

/**
 * Default HTTP Parameter Pollution (HPP) middleware instance.
 */
export const hppMiddleware: RequestHandler = createHppMiddleware();
