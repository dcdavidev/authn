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
 * CORS configuration options.
 */
export const corsOptions: CorsOptions = {
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
};

/**
 * Cross-Origin Resource Sharing (CORS) middleware.
 *
 * @type {RequestHandler}
 */
export const corsMiddleware: RequestHandler = cors(corsOptions);

/**
 * Helmet middleware to secure Express apps by setting various HTTP headers.
 *
 * @type {RequestHandler}
 */
export const helmetMiddleware: RequestHandler = helmet();

/**
 * HTTP Parameter Pollution (HPP) middleware to protect against parameter pollution attacks in query strings and body.
 *
 * @type {RequestHandler}
 */
export const hppMiddleware: RequestHandler = hpp();
