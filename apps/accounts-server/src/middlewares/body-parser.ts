/**
 * @file Body parsing middlewares for handling incoming JSON and URL-encoded request payloads.
 * @module middlewares/body-parser
 */

import express, { type RequestHandler } from 'express';

import { config } from '../config/env.js';

/**
 * Middleware for parsing incoming JSON request bodies.
 *
 * @type {RequestHandler}
 */
export const jsonBodyParser: RequestHandler = express.json({
  limit: config.bodyLimit,
});

/**
 * Middleware for parsing incoming URL-encoded form data with extended syntax.
 *
 * @type {RequestHandler}
 */
export const urlencodedBodyParser: RequestHandler = express.urlencoded({
  extended: true,
  limit: config.bodyLimit,
});

/**
 * Combined list of standard body parser middlewares.
 *
 * @type {RequestHandler[]}
 */
export const bodyParserMiddlewares: RequestHandler[] = [
  jsonBodyParser,
  urlencodedBodyParser,
];
