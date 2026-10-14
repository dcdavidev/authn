/**
 * @file Health check routes providing detailed system metrics and container orchestration probes.
 * @module routes/health
 */

import os from 'node:os';
import process from 'node:process';

import { type Request, type Response, Router } from 'express';

/**
 * Formats a duration in seconds into a human-readable string.
 *
 * @param seconds - Duration in seconds.
 * @returns Human-readable duration string.
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86_400);
  const hours = Math.floor((seconds % 86_400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const parts: string[] = [];
  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${remainingSeconds}s`);

  return parts.join(' ');
}

/**
 * Collects current memory metrics in megabytes.
 *
 * @returns Memory statistics in megabytes.
 */
function getMemoryStats() {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
    rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
  };
}

/**
 * Collects host system diagnostics.
 *
 * @returns System diagnostic statistics.
 */
function getSystemStats() {
  return {
    loadAverage: os.loadavg().map((load) => Math.round(load * 100) / 100),
    freeMemoryMb: Math.round((os.freemem() / 1024 / 1024) * 100) / 100,
    totalMemoryMb: Math.round((os.totalmem() / 1024 / 1024) * 100) / 100,
    cpuCores: os.cpus().length,
  };
}

/**
 * Express router dedicated to health check endpoints.
 */
export const healthRouter: Router = Router();

/**
 * GET /health
 * Detailed health diagnostics and system metrics.
 */
healthRouter.get('/', (_req: Request, res: Response) => {
  const uptimeSeconds = Math.floor(process.uptime());

  res.status(200).json({
    status: 'ok',
    service: '@authn/accounts-api',
    environment: process.env.NODE_ENV ?? 'development',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: uptimeSeconds,
      formatted: formatUptime(uptimeSeconds),
    },
    process: {
      pid: process.pid,
      nodeVersion: process.version,
      platform: process.platform,
    },
    memory: getMemoryStats(),
    system: getSystemStats(),
  });
});

/**
 * GET /health/live
 * Kubernetes liveness probe endpoint.
 */
healthRouter.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe endpoint.
 */
healthRouter.get('/ready', (_req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const heapUsageRatio = mem.heapUsed / mem.heapTotal;

  // Verify heap usage has not critically saturated
  if (heapUsageRatio > 0.98) {
    res.status(503).json({
      status: 'not_ready',
      reason: 'Critical memory pressure',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      memory: 'ok',
    },
  });
});
