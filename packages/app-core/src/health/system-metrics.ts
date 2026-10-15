/**
 * @file System, process, and memory diagnostics collection utilities.
 * @module health/system-metrics
 */

import os from 'node:os';
import process from 'node:process';

import { formatUptime } from './formatters.js';

/**
 * Memory consumption metrics represented in megabytes.
 */
export interface MemoryStats {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
}

/**
 * Host operating system diagnostics.
 */
export interface SystemStats {
  loadAverage: number[];
  freeMemoryMb: number;
  totalMemoryMb: number;
  cpuCores: number;
}

/**
 * Node.js runtime process metadata.
 */
export interface ProcessStats {
  pid: number;
  nodeVersion: string;
  platform: string;
}

/**
 * Service uptime metrics.
 */
export interface UptimeStats {
  seconds: number;
  formatted: string;
}

/**
 * Collects current Node.js heap and RSS memory consumption in megabytes.
 *
 * @returns Memory statistics in megabytes.
 */
export function getMemoryStats(): MemoryStats {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
    rssMb: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    externalMb: Math.round((mem.external / 1024 / 1024) * 100) / 100,
  };
}

/**
 * Collects operating system metrics (load average, memory capacity, CPU core count).
 *
 * @returns System diagnostic statistics.
 */
export function getSystemStats(): SystemStats {
  return {
    loadAverage: os.loadavg().map((load) => Math.round(load * 100) / 100),
    freeMemoryMb: Math.round((os.freemem() / 1024 / 1024) * 100) / 100,
    totalMemoryMb: Math.round((os.totalmem() / 1024 / 1024) * 100) / 100,
    cpuCores: os.cpus().length,
  };
}

/**
 * Collects current process identifiers and platform information.
 *
 * @returns Process runtime statistics.
 */
export function getProcessStats(): ProcessStats {
  return {
    pid: process.pid,
    nodeVersion: process.version,
    platform: process.platform,
  };
}

/**
 * Collects uptime in seconds and formatted duration.
 *
 * @returns Uptime statistics.
 */
export function getUptimeStats(): UptimeStats {
  const seconds = Math.floor(process.uptime());
  return {
    seconds,
    formatted: formatUptime(seconds),
  };
}
