/**
 * @file Pino application logger setup and configuration.
 * @module logger/logger
 */

import pretty from 'pino-pretty';

import pino, { type Logger, type LoggerOptions } from 'pino';

import { config } from '../config/env.js';

/**
 * Creates and configures the main Pino logger instance.
 *
 * In development environments, it formats logs via `pino-pretty`
 * for colored, readable terminal output. In production, logs are output
 * as structured JSON for log aggregators.
 *
 * @returns The configured Pino logger instance.
 */
function createLogger(): Logger {
  const options: LoggerOptions = {
    level: config.logLevel,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => ({ level: label }),
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'password',
        'token',
      ],
      censor: '[REDACTED]',
    },
  };

  if (config.isDevelopment && !config.isTest) {
    const prettyStream = pretty({
      colorize: true,
      translateTime: 'yyyy-mm-dd HH:MM:ss.l',
      ignore: 'pid,hostname',
      singleLine: false,
    });

    return pino(options, prettyStream);
  }

  return pino(options);
}

/**
 * Shared application logger instance.
 */
export const logger: Logger = createLogger();
