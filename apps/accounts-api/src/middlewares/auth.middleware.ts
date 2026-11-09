/**
 * @file Authentication middlewares supporting HTTP Basic and Bearer JWT schemes.
 * @module middlewares/auth.middleware
 */

import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { HttpError } from 'wnodex/errors';

import {
  type VerifiedAccessTokenPayload,
  verifyAccessToken,
} from '../lib/jwt.js';
import { verifyPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma-client.js';
import { validateEmail } from '../lib/validation.js';

/**
 * Sanitized user profile attached to authenticated requests.
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string | null;
  emailVerifiedAt: Date | null;
  mfaEnabled: boolean;
  createdAt: Date;
}

/**
 * Authentication context attached to `req.auth` after successful authentication.
 */
export interface AuthContext {
  /** Authenticated user record. */
  user: AuthenticatedUser;
  /** Authentication scheme used (`Bearer` for JWT, `Basic` for HTTP Basic). */
  scheme: 'Bearer' | 'Basic';
  /** Decoded JWT payload when authenticated via `Bearer` token. */
  tokenPayload?: VerifiedAccessTokenPayload;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}

/**
 * Extracts decoded `{ email, password }` credentials from an HTTP `Basic` Authorization header.
 *
 * @param authorizationHeader - Raw `Authorization` header value.
 * @returns Decoded credentials or `null` when the header is not a `Basic` header.
 * @throws {HttpError} 401 Unauthorized when the `Basic` header is malformed.
 */
export function extractBasicCredentials(
  authorizationHeader?: string
): { email: string; password: string } | null {
  if (!authorizationHeader) {
    return null;
  }

  const trimmed = authorizationHeader.trim();
  if (!/^basic\s+/i.test(trimmed)) {
    return null;
  }

  const base64Credentials = trimmed.replace(/^basic\s+/i, '').trim();
  if (!base64Credentials) {
    throw HttpError.unauthorized('Malformed Basic authentication header.');
  }

  const decoded = Buffer.from(base64Credentials, 'base64').toString('utf8');
  const separatorIndex = decoded.indexOf(':');

  if (separatorIndex === -1) {
    throw HttpError.unauthorized('Malformed Basic authentication credentials.');
  }

  const email = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  return { email, password };
}

/**
 * Extracts a JWT token string from an HTTP `Bearer` Authorization header.
 *
 * @param authorizationHeader - Raw `Authorization` header value.
 * @returns Raw token string or `null` when the header is not a `Bearer` header.
 * @throws {HttpError} 401 Unauthorized when the `Bearer` header is empty.
 */
export function extractBearerToken(
  authorizationHeader?: string
): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const trimmed = authorizationHeader.trim();
  if (!/^bearer\s+/i.test(trimmed)) {
    return null;
  }

  const token = trimmed.replace(/^bearer\s+/i, '').trim();
  if (!token) {
    throw HttpError.unauthorized('Missing Bearer access token.');
  }

  return token;
}

/**
 * Verifies an email and password pair against the database and returns the sanitized user.
 *
 * @param rawEmail - Raw email input.
 * @param rawPassword - Raw password input.
 * @returns Authenticated user record.
 * @throws {HttpError} 400 Bad Request or 401 Unauthorized on invalid input or credentials.
 */
export async function verifyUserCredentials(
  rawEmail: unknown,
  rawPassword: unknown
): Promise<AuthenticatedUser> {
  const emailResult = validateEmail(rawEmail);
  if (!emailResult.valid || !emailResult.normalizedEmail) {
    throw HttpError.badRequest(
      emailResult.message ?? 'Please provide a valid email address.'
    );
  }

  if (typeof rawPassword !== 'string' || rawPassword.length === 0) {
    throw HttpError.badRequest('Password is required.');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: emailResult.normalizedEmail },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      displayName: true,
      emailVerifiedAt: true,
      mfaEnabled: true,
      createdAt: true,
    },
  });

  if (!existingUser?.passwordHash) {
    throw HttpError.unauthorized('Invalid email or password.');
  }

  const isPasswordValid = await verifyPassword(
    rawPassword,
    existingUser.passwordHash
  );

  if (!isPasswordValid) {
    throw HttpError.unauthorized('Invalid email or password.');
  }

  const { passwordHash: _passwordHash, ...user } = existingUser;
  return user;
}

/**
 * Resolves an authenticated user from a Bearer JWT access token.
 *
 * @param token - Raw JWT token string.
 * @returns Authentication context containing user and verified token payload.
 */
async function authenticateWithBearerToken(
  token: string
): Promise<AuthContext> {
  const tokenPayload = verifyAccessToken(token);

  const user = await prisma.user.findUnique({
    where: { id: tokenPayload.sub },
    select: {
      id: true,
      email: true,
      displayName: true,
      emailVerifiedAt: true,
      mfaEnabled: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw HttpError.unauthorized('Authenticated user no longer exists.');
  }

  return {
    user,
    scheme: 'Bearer',
    tokenPayload,
  };
}

/**
 * Middleware that authenticates requests using a Bearer JWT access token.
 */
export const authenticateJwt: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      throw HttpError.unauthorized('Bearer access token is required.');
    }

    req.auth = await authenticateWithBearerToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware that authenticates requests using HTTP Basic credentials.
 */
export const authenticateBasic: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const credentials = extractBasicCredentials(req.headers.authorization);
    if (!credentials) {
      throw HttpError.unauthorized(
        'Basic authentication credentials required.'
      );
    }

    const user = await verifyUserCredentials(
      credentials.email,
      credentials.password
    );

    req.auth = {
      user,
      scheme: 'Basic',
    };
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware that authenticates requests via either Bearer JWT or HTTP Basic schemes.
 */
export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw HttpError.unauthorized('Authorization header is required.');
    }

    const bearerToken = extractBearerToken(authHeader);
    if (bearerToken) {
      req.auth = await authenticateWithBearerToken(bearerToken);
      next();
      return;
    }

    const basicCredentials = extractBasicCredentials(authHeader);
    if (basicCredentials) {
      const user = await verifyUserCredentials(
        basicCredentials.email,
        basicCredentials.password
      );

      req.auth = {
        user,
        scheme: 'Basic',
      };
      next();
      return;
    }

    throw HttpError.unauthorized(
      'Unsupported Authorization scheme. Use Bearer or Basic.'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Factory creating a middleware that authenticates requests using a Bearer JWT access token.
 *
 * @returns Express request handler.
 */
export function createJwtAuthMiddleware(): RequestHandler {
  return authenticateJwt;
}

/**
 * Factory creating a middleware that authenticates requests using HTTP Basic credentials.
 *
 * @returns Express request handler.
 */
export function createBasicAuthMiddleware(): RequestHandler {
  return authenticateBasic;
}

/**
 * Factory creating a middleware that authenticates requests via either Bearer JWT or HTTP Basic.
 *
 * @returns Express request handler.
 */
export function createAuthMiddleware(): RequestHandler {
  return authenticate;
}
