/**
 * @file Root and metadata controller for the accounts API.
 * @module controllers/root.controller
 */

import type { Request, Response } from 'express';

/**
 * Service metadata response structure.
 */
export interface ServiceMetadata {
  /** Service name identifier */
  service: string;
  /** High-level operational status */
  status: 'online' | 'degraded' | 'offline';
  /** Application version */
  version: string;
  /** Current runtime environment */
  environment: string;
  /** Process uptime in seconds */
  uptime: number;
  /** Timestamp in ISO 8601 format */
  timestamp: string;
  /** Main health check endpoint */
  health: string;
  /** Key available endpoints and navigation links */
  endpoints: {
    self: string;
    health: string;
    live: string;
    ready: string;
  };
}

/**
 * Controller handling service root and metadata requests.
 */
export class RootController {
  /**
   * GET /
   * Returns metadata and navigation endpoints for the service.
   *
   * @param req - Express request object.
   * @param res - Express response object.
   */
  getRoot = (req: Request, res: Response): void => {
    const service =
      (req.app.get('serviceName') as string | undefined) ??
      '@authn/accounts-api';
    const environment =
      (req.app.get('nodeEnv') as string | undefined) ??
      process.env.NODE_ENV ??
      'development';

    const metadata: ServiceMetadata = {
      service,
      status: 'online',
      version: process.env.npm_package_version ?? '0.0.1',
      environment,
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      health: '/health',
      endpoints: {
        self: '/',
        health: '/health',
        live: '/health/live',
        ready: '/health/ready',
      },
    };

    res.status(200).json(metadata);
  };
}

/**
 * Singleton instance of RootController.
 */
export const rootController: RootController = new RootController();
