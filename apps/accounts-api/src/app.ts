/**
 * @file Express application factory for accounts API.
 * @module app
 */

import type { Express } from 'express';

import { createApp as createBaseApp } from '@authn/app-core';

import { rootRouter } from './routes/index.js';

/**
 * Creates and configures the accounts API Express application.
 *
 * @returns Fully configured Express application instance.
 */
export function createApp(): Express {
  return createBaseApp({
    serviceName: '@authn/accounts-api',
    routes: rootRouter,
  });
}
