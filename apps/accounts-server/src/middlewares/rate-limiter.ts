/**
 * @file Rate limiting middleware to protect the application from brute-force and DoS attacks.
 * @module middlewares/rate-limiter
 */

import type { Request, Response } from 'express';

import { rateLimit, type RateLimitRequestHandler } from 'express-rate-limit';

import { config } from '../config/env.js';

/**
 * Global rate limiter middleware.
 * Restricts client requests based on IP address and configured limits.
 *
 * @type {RateLimitRequestHandler}
 */
export const rateLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: config.rateLimitWindowMs,
  limit: config.rateLimitMax,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  message: {
    status: 429,
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please try again later.',
  },
  handler: (_req: Request, res: Response, _next, options) => {
    res.status(options.statusCode).json(options.message);
  },
});
