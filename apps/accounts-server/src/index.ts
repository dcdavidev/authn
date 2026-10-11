/**
 * @file Application entry point. Boots the Express HTTP server and binds graceful shutdown.
 * @module index
 */

import type { Server } from 'node:http';

import type { Express } from 'express';

import { createApp } from './app.js';
import { config } from './config/env.js';
import { logger } from './logger/logger.js';
import { setupGracefulShutdown } from './server/shutdown.js';

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
  const server: Server = app.listen(config.port, config.host, () => {
    logger.info(
      {
        host: config.host,
        port: config.port,
        nodeEnv: config.nodeEnv,
        pid: process.pid,
      },
      `🚀 Accounts server started on http://${config.host}:${config.port}`
    );
  });

  setupGracefulShutdown(server);

  return server;
}

/**
 * Server instance running the application.
 */
export const server: Server = startServer();
