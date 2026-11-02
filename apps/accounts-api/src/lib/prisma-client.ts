/**
 * @file Prisma database client singleton configured with the PostgreSQL driver adapter.
 * @module lib/prisma-client
 */

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from './prisma/client.js';

/**
 * Database connection string resolved from environment variables.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

/**
 * Global reference used to persist the Prisma client instance across hot reloads in development.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton instance of PrismaClient.
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
    }),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
