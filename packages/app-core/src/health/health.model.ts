/**
 * @file Health domain model coordinating diagnostics collection and plugin checks.
 * @module health/health.model
 */

import process from 'node:process';

import type { Application } from 'express';

import { config as defaultConfig } from '../config/env.js';
import type {
  DetailedHealthReport,
  HealthPlugin,
  HealthPluginResult,
  LivenessReport,
  ReadinessReport,
} from './health.types.js';
import {
  getMemoryStats,
  getProcessStats,
  getSystemStats,
  getUptimeStats,
} from './system-metrics.js';

/**
 * Domain model managing health data, system metrics collection,
 * and extensible plugin checks.
 */
export class HealthModel {
  private readonly plugins = new Map<string, HealthPlugin>();

  /**
   * Registers a custom health indicator plugin (e.g. database ping, redis probe).
   *
   * @param plugin - The health plugin instance.
   * @returns This model instance for chaining.
   */
  registerPlugin(plugin: HealthPlugin): this {
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  /**
   * Unregisters a health plugin by name.
   *
   * @param name - The name of the plugin to remove.
   * @returns True if the plugin existed and was removed.
   */
  unregisterPlugin(name: string): boolean {
    return this.plugins.delete(name);
  }

  /**
   * Retrieves a registered plugin by name.
   *
   * @param name - Plugin name identifier.
   * @returns The registered plugin, or undefined if not found.
   */
  getPlugin(name: string): HealthPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Returns all currently registered plugins.
   *
   * @returns Array of registered health plugins.
   */
  getPlugins(): HealthPlugin[] {
    return [...this.plugins.values()];
  }

  /**
   * Collects all active plugins from both model registry and application settings.
   *
   * @param [app] - Optional Express application instance to check for injected plugins.
   * @returns Combined array of plugins.
   */
  collectPlugins(app?: Application): HealthPlugin[] {
    const list = [...this.plugins.values()];
    if (app && typeof app.get === 'function') {
      const appPlugins = app.get('healthPlugins');
      if (Array.isArray(appPlugins)) {
        for (const p of appPlugins) {
          if (
            p &&
            typeof p.name === 'string' &&
            typeof p.check === 'function' &&
            !this.plugins.has(p.name)
          ) {
            list.push(p);
          }
        }
      }
    }
    return list;
  }

  /**
   * Generates a Kubernetes liveness probe payload.
   *
   * @returns Liveness status report.
   */
  getLiveness(): LivenessReport {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  /**
   * Generates an extensible detailed system diagnostics report.
   * Reads environment configuration from the application settings or core config,
   * rather than reading process.env.NODE_ENV directly.
   *
   * @param serviceName - Service name identifier.
   * @param [app] - Optional Express application instance.
   * @returns Promise resolving to the detailed diagnostics report.
   */
  async getDetailedHealth(
    serviceName: string,
    app?: Application
  ): Promise<DetailedHealthReport> {
    const uptime = getUptimeStats();
    const plugins = this.collectPlugins(app);

    const services: Record<string, HealthPluginResult> = {};
    let overallHealthy = true;

    for (const plugin of plugins) {
      try {
        const result = await plugin.check(app);
        services[plugin.name] = result;
        const s = result.status;
        if (
          plugin.critical &&
          (s === 'down' || s === 'error' || s === 'not_ready')
        ) {
          overallHealthy = false;
        }
      } catch (error) {
        services[plugin.name] = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        };
        if (plugin.critical) {
          overallHealthy = false;
        }
      }
    }

    const environment =
      (app?.get('nodeEnv') as string | undefined) ??
      (app?.get('env') as string | undefined) ??
      defaultConfig.nodeEnv;

    const report: DetailedHealthReport = {
      status: overallHealthy ? 'ok' : 'degraded',
      service: serviceName,
      environment,
      timestamp: new Date().toISOString(),
      uptime,
      process: getProcessStats(),
      memory: getMemoryStats(),
      system: getSystemStats(),
    };

    if (Object.keys(services).length > 0) {
      report.services = services;
    }

    return report;
  }

  /**
   * Performs readiness checks (memory saturation and critical service plugins).
   *
   * @param [app] - Optional Express application instance.
   * @returns Readiness evaluation containing status code and payload.
   */
  async getReadiness(app?: Application): Promise<{
    isReady: boolean;
    statusCode: number;
    report: ReadinessReport;
  }> {
    const mem = process.memoryUsage();
    const heapUsageRatio = mem.heapUsed / mem.heapTotal;
    const checks: Record<string, string> = {};

    if (heapUsageRatio > 0.98) {
      return {
        isReady: false,
        statusCode: 503,
        report: {
          status: 'not_ready',
          reason: 'Critical memory pressure',
          timestamp: new Date().toISOString(),
          checks: {
            memory: 'critical_saturation',
          },
        },
      };
    }

    checks.memory = 'ok';
    let isReady = true;
    let failureReason: string | undefined;
    const details: Record<string, unknown> = {};

    const plugins = this.collectPlugins(app);
    for (const plugin of plugins) {
      try {
        const result = await plugin.check(app);
        const pluginStatus = result.status ?? 'ok';
        checks[plugin.name] = String(pluginStatus);
        details[plugin.name] = result;

        if (
          plugin.critical &&
          (pluginStatus === 'down' ||
            pluginStatus === 'error' ||
            pluginStatus === 'not_ready')
        ) {
          isReady = false;
          failureReason = `Critical check failed: ${plugin.name}`;
        }
      } catch (error) {
        checks[plugin.name] = 'error';
        details[plugin.name] = {
          status: 'error',
          error: error instanceof Error ? error.message : String(error),
        };
        if (plugin.critical) {
          isReady = false;
          failureReason = `Critical check failed: ${plugin.name}`;
        }
      }
    }

    if (!isReady) {
      return {
        isReady: false,
        statusCode: 503,
        report: {
          status: 'not_ready',
          reason: failureReason,
          timestamp: new Date().toISOString(),
          checks,
          ...(Object.keys(details).length > 0 ? { details } : {}),
        },
      };
    }

    return {
      isReady: true,
      statusCode: 200,
      report: {
        status: 'ready',
        timestamp: new Date().toISOString(),
        checks,
        ...(Object.keys(details).length > 0 ? { details } : {}),
      },
    };
  }
}

/**
 * Default singleton instance of HealthModel.
 */
export const healthModel = new HealthModel();
