/**
 * @file Body parsing middlewares for handling incoming JSON and URL-encoded payloads.
 * @module middlewares/body-parser
 */

import express, { type RequestHandler } from 'express';

import { config } from '../config/env.js';

/**
 * Creates middleware for parsing incoming JSON request bodies.
 *
 * @param [limit] - Maximum body size limit (e.g. '1mb', '5mb').
 * @returns Express JSON parsing middleware.
 */
export function createJsonBodyParser(limit?: string): RequestHandler {
  return express.json({
    limit: limit ?? config.bodyLimit,
  });
}

/**
 * Middleware for parsing incoming JSON request bodies using default settings.
 */
export const jsonBodyParser: RequestHandler = createJsonBodyParser();

/**
 * Creates middleware for parsing incoming URL-encoded form data.
 *
 * @param [limit] - Maximum body size limit (e.g. '1mb', '5mb').
 * @returns Express URL-encoded parsing middleware.
 */
export function createUrlencodedBodyParser(limit?: string): RequestHandler {
  return express.urlencoded({
    extended: true,
    limit: limit ?? config.bodyLimit,
  });
}

/**
 * Middleware for parsing incoming URL-encoded form data using default settings.
 */
export const urlencodedBodyParser: RequestHandler =
  createUrlencodedBodyParser();

/**
 * Creates the combined array of standard body parser middlewares.
 *
 * @param [limit] - Maximum body size limit.
 * @returns Array containing JSON and URL-encoded body parser handlers.
 */
export function createBodyParserMiddlewares(limit?: string): RequestHandler[] {
  return [createJsonBodyParser(limit), createUrlencodedBodyParser(limit)];
}

/**
 * Combined list of standard body parser middlewares using default configuration.
 */
export const bodyParserMiddlewares: RequestHandler[] =
  createBodyParserMiddlewares();
