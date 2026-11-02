/**
 * @file Application entry point. Boots the Express HTTP server and binds graceful shutdown.
 * @module index
 */

import '@dotenvx/dotenvx/config';

import type { Server } from 'node:http';

import type { Express } from 'express';

import { createApp, createDatabaseHealthPlugin, startServer } from 'wnodex';

import { prisma } from './lib/prisma-client.js';
import { rootRouter } from './routes/index.js';

/**
 * Express application instance.
 */
export const app: Express = createApp({
  serviceName: '@authn/accounts-api',
  routes: rootRouter,
  healthOptions: {
    plugins: [
      createDatabaseHealthPlugin(
        async () => {
          const [result] = await prisma.$queryRaw<[{ exists: boolean }]>`
            SELECT to_regclass('public.users') IS NOT NULL AS "exists"
          `;

          return Boolean(result?.exists);
        },
        { critical: true }
      ),
    ],
  },
});

/**
 * Server instance running the application.
 */
export const server: Server = startServer(app);
