/**
 * @file Express application factory for accounts server.
 * @module app
 */

import type { Express } from 'express';

import { createApp as createBaseApp } from '@authn/server';

import { rootRouter } from './routes/index.js';

/**
 * Creates and configures the accounts server Express application.
 *
 * @returns Fully configured Express application instance.
 */
export function createApp(): Express {
  return createBaseApp({
    serviceName: '@authn/accounts-server',
    routes: rootRouter,
  });
}
