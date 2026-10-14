/**
 * @file Graceful shutdown coordinator for the HTTP server and runtime resources.
 * @module server/shutdown
 */

/* eslint-disable unicorn/no-process-exit */

import type { Server } from 'node:http';

import type { Logger } from 'pino';

import { config } from '../config/env.js';
import { logger as defaultLogger } from '../logger/logger.js';

/**
 * Cleanup function signature for resources that must be released before termination.
 */
export type CleanupHook = () => Promise<void> | void;

/**
 * Configuration options for graceful shutdown handling.
 */
export interface ShutdownOptions {
  /** Maximum grace period in milliseconds before forcing process termination */
  timeoutMs?: number;
  /** Optional array of asynchronous cleanup hooks (e.g., database disconnections) */
  cleanupHooks?: CleanupHook[];
  /** Custom logger instance */
  logger?: Logger;
}

/**
 * Registers signal handlers (SIGTERM, SIGINT) and process error listeners
 * (uncaughtException, unhandledRejection) to ensure the server gracefully
 * drains connections and releases resources before terminating.
 *
 * @param server - The running Node.js HTTP server instance.
 * @param [options] - Optional custom options for the shutdown sequence.
 */
export function setupGracefulShutdown(
  server: Server,
  options: ShutdownOptions = {}
): void {
  const activeLogger = options.logger ?? defaultLogger;
  const timeoutMs = options.timeoutMs ?? config.shutdownTimeoutMs;
  const cleanupHooks = options.cleanupHooks ?? [];

  let isShuttingDown = false;

  /**
   * Orchestrates the graceful shutdown procedure.
   *
   * @param trigger - The signal or event that initiated the shutdown.
   * @param exitCode - The process exit code (0 for normal, 1 for abnormal).
   */
  async function handleShutdown(
    trigger: string,
    exitCode: number
  ): Promise<void> {
    if (isShuttingDown) {
      activeLogger.warn(
        `Shutdown already in progress. Ignoring duplicate trigger: ${trigger}`
      );
      return;
    }

    isShuttingDown = true;
    activeLogger.info(`Received ${trigger}. Starting graceful shutdown...`);

    // Safety timeout: force exit if graceful cleanup exceeds timeoutMs
    const forceExitTimer = setTimeout(() => {
      activeLogger.error(
        `Graceful shutdown timed out after ${timeoutMs}ms. Forcing process exit.`
      );
      process.exit(1);
    }, timeoutMs);

    // Prevent the force exit timer from keeping the event loop alive if everything closes cleanly
    forceExitTimer.unref();

    try {
      // Stop accepting new connections and drain existing ones
      await new Promise<void>((resolve, reject) => {
        server.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      // Close idle keep-alive connections if supported by the Node.js runtime
      if (typeof server.closeIdleConnections === 'function') {
        server.closeIdleConnections();
      }

      activeLogger.info(
        'HTTP server successfully stopped accepting connections.'
      );

      // Run registered cleanup hooks (e.g., database disconnection)
      for (const hook of cleanupHooks) {
        await hook();
      }

      activeLogger.info(
        'All cleanup tasks completed successfully. Exiting process.'
      );
      clearTimeout(forceExitTimer);
      process.exit(exitCode);
    } catch (error) {
      activeLogger.error(
        { error },
        'Error occurred during graceful shutdown sequence.'
      );
      clearTimeout(forceExitTimer);
      process.exit(1);
    }
  }

  // Handle process termination signals
  process.on('SIGTERM', () => {
    void handleShutdown('SIGTERM', 0);
  });

  process.on('SIGINT', () => {
    void handleShutdown('SIGINT', 0);
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    activeLogger.fatal({ err: error }, `Uncaught exception: ${error.message}`);
    void handleShutdown('uncaughtException', 1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown) => {
    activeLogger.fatal({ reason }, 'Unhandled promise rejection detected.');
    void handleShutdown('unhandledRejection', 1);
  });
}
