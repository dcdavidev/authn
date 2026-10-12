/**
 * @file Application entry point. Boots the Express HTTP server and binds graceful shutdown.
 * @module index
 */

import type { Server } from 'node:http';

import type { Express } from 'express';

import { startServer as runServer } from '@authn/server';

import { createApp } from './app.js';

/**
 * Express application instance.
 */
export const app: Express = createApp();

/**
 * Starts the HTTP server and registers graceful termination signal handlers.
 *
 * @returns The started Node.js HTTP server.
 */
export function startServer(): Server {
  return runServer(app, {
    serviceName: 'Accounts server',
  });
}

/**
 * Server instance running the application.
 */
export const server: Server = startServer();
