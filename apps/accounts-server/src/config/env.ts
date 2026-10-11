/**
 * @file Application environment configuration.
 * @module config/env
 */

/**
 * Interface representing the strongly-typed application configuration.
 */
export interface AppConfig {
  /** Runtime environment (e.g., 'development', 'production', 'test') */
  nodeEnv: string;
  /** Whether the application is running in development mode */
  isDevelopment: boolean;
  /** Whether the application is running in production mode */
  isProduction: boolean;
  /** Whether the application is running in test mode */
  isTest: boolean;
  /** Server network port */
  port: number;
  /** Server host address */
  host: string;
  /** Log level for Pino logger */
  logLevel: string;
  /** Maximum grace period in milliseconds before forcing process exit during shutdown */
  shutdownTimeoutMs: number;
  /** Request body size limit (e.g., '1mb') */
  bodyLimit: string;
  /** Allowed CORS origins (string, array of strings, or '*' for all) */
  corsOrigin: string | string[];
  /** Rate limiting window duration in milliseconds */
  rateLimitWindowMs: number;
  /** Maximum number of requests allowed within the rate limiting window */
  rateLimitMax: number;
}

/**
 * Parses and returns the application configuration loaded from environment variables.
 *
 * @returns The resolved configuration object.
 */
export function loadConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const isDevelopment = nodeEnv === 'development';
  const isProduction = nodeEnv === 'production';
  const isTest = nodeEnv === 'test';

  const rawPort = process.env.PORT;
  const parsedPort = rawPort ? Number.parseInt(rawPort, 10) : 3000;
  const port = Number.isNaN(parsedPort) ? 3000 : parsedPort;

  const host = process.env.HOST ?? '0.0.0.0';
  const logLevel = process.env.LOG_LEVEL ?? (isDevelopment ? 'debug' : 'info');

  const rawShutdownTimeout = process.env.SHUTDOWN_TIMEOUT_MS;
  const parsedShutdownTimeout = rawShutdownTimeout
    ? Number.parseInt(rawShutdownTimeout, 10)
    : 10_000;
  const shutdownTimeoutMs = Number.isNaN(parsedShutdownTimeout)
    ? 10_000
    : parsedShutdownTimeout;

  const bodyLimit = process.env.BODY_LIMIT ?? '1mb';

  const rawCorsOrigin = process.env.CORS_ORIGIN ?? '*';
  const corsOrigin = rawCorsOrigin.includes(',')
    ? rawCorsOrigin.split(',').map((origin) => origin.trim())
    : rawCorsOrigin;

  const rawRateLimitWindowMs = process.env.RATE_LIMIT_WINDOW_MS;
  const parsedRateLimitWindow = rawRateLimitWindowMs
    ? Number.parseInt(rawRateLimitWindowMs, 10)
    : 15 * 60 * 1000; // 15 minutes
  const rateLimitWindowMs = Number.isNaN(parsedRateLimitWindow)
    ? 15 * 60 * 1000
    : parsedRateLimitWindow;

  const rawRateLimitMax = process.env.RATE_LIMIT_MAX;
  const parsedRateLimitMax = rawRateLimitMax
    ? Number.parseInt(rawRateLimitMax, 10)
    : 100;
  const rateLimitMax = Number.isNaN(parsedRateLimitMax)
    ? 100
    : parsedRateLimitMax;

  return {
    nodeEnv,
    isDevelopment,
    isProduction,
    isTest,
    port,
    host,
    logLevel,
    shutdownTimeoutMs,
    bodyLimit,
    corsOrigin,
    rateLimitWindowMs,
    rateLimitMax,
  };
}

/**
 * Singleton configuration instance for the application.
 */
export const config: AppConfig = loadConfig();
