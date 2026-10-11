/**
 * @file Centralized error handling and 404 fallback middlewares.
 * @module middlewares/error-handler
 */

import type {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

import { config } from '../config/env.js';
import { logger } from '../logger/logger.js';

/**
 * Custom application HTTP error class.
 */
export class HttpError extends Error {
  /** Numerical HTTP status code returned to the client. */
  public statusCode: number;

  /**
   * Initializes a new HTTP error instance with a status code and diagnostic message.
   *
   * @param statusCode - Numerical status code representing the client or server fault.
   * @param message - Descriptive message detailing the underlying failure.
   */
  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Fallback middleware for unhandled route paths (404 Not Found).
 *
 * @param req - Express request object.
 * @param res - Express response object.
 */
export const notFoundHandler: RequestHandler = (
  req: Request,
  res: Response
): void => {
  res.status(404).json({
    status: 404,
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Global error-handling middleware.
 * Catches all errors forwarded by `next(err)`, logs them, and formats a consistent JSON response.
 *
 * @param err - Captured error instance.
 * @param req - Express request object.
 * @param res - Express response object.
 * @param _next - Express next function.
 */
export const errorHandler: ErrorRequestHandler = (
  err: Error | HttpError,
  req: Request,
  res: Response,

  _next: NextFunction
): void => {
  const statusCode =
    'statusCode' in err && typeof err.statusCode === 'number'
      ? err.statusCode
      : 500;

  logger.error(
    {
      err,
      method: req.method,
      url: req.originalUrl,
      statusCode,
    },
    `Unhandled error caught during request processing: ${err.message}`
  );

  if (res.headersSent) {
    return;
  }

  res.status(statusCode).json({
    status: statusCode,
    error: err.name || 'InternalServerError',
    message:
      statusCode === 500 && config.isProduction
        ? 'An internal server error occurred.'
        : err.message,
    ...(config.isDevelopment ? { stack: err.stack } : {}),
  });
};
