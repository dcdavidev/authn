/**
 * @file Application entry point. Boots the Express HTTP server and binds graceful shutdown.
 * @module index
 */

import type { Server } from 'node:http';

import type { Express } from 'express';

import { createApp, startServer } from '@authn/app-core';

import { rootRouter } from './routes/index.js';

/**
 * Express application instance.
 */
export const app: Express = createApp({
  serviceName: '@authn/accounts-api',
  routes: rootRouter,
});

/**
 * Server instance running the application.
 */
export const server: Server = startServer(app);
