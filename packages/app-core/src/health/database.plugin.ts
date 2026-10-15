/**
 * @file Database health check plugin factory.
 * @module health/database.plugin
 */

import type { HealthPlugin } from './health.types.js';

/**
 * Factory helper to construct a database health plugin (e.g. for PostgreSQL, Prisma, MongoDB, etc.).
 *
 * @param pingFn - Async function performing the database ping or query.
 * @param [options] - Plugin configuration options.
 * @param [options.critical] - Whether failure should trigger HTTP 503.
 * @param [options.name] - Custom name for the plugin.
 * @returns Configured HealthPlugin.
 */
export function createDatabaseHealthPlugin(
  pingFn: () => Promise<boolean | void>,
  options?: { critical?: boolean; name?: string }
): HealthPlugin {
  return {
    name: options?.name ?? 'database',
    critical: options?.critical ?? true,
    async check() {
      const start = Date.now();
      try {
        const result = await pingFn();
        const latencyMs = Date.now() - start;
        return {
          status: result === false ? 'down' : 'up',
          latencyMs,
        };
      } catch (error) {
        return {
          status: 'down',
          latencyMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    },
  };
}
