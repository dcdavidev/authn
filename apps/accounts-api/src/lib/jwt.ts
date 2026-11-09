/**
 * @file JSON Web Token (JWT) signing and verification utilities.
 * @module lib/jwt
 */

import jwt, { type JwtPayload } from 'jsonwebtoken';
import { ConfigError, HttpError } from 'wnodex/errors';

/**
 * Default JWT access token lifetime in seconds (1 hour).
 */
export const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 3600;

/**
 * Default JWT issuer identifier.
 */
export const JWT_ISSUER = '@authn/accounts-api';

/**
 * Claims embedded in an access token payload when signing.
 */
export interface AccessTokenClaims {
  /** Subject identifier (User UUID). */
  sub: string;
  /** Normalized user email address. */
  email: string;
  /** Optional user display name. */
  displayName?: string | null;
}

/**
 * Decoded and verified JWT access token payload.
 */
export interface VerifiedAccessTokenPayload extends JwtPayload {
  sub: string;
  email: string;
  displayName?: string | null;
}

/**
 * Resolves the JWT signing secret from the `JWT_TOKEN` environment variable.
 *
 * @returns Non-empty secret string.
 * @throws {ConfigError} When `JWT_TOKEN` is missing or empty.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_TOKEN?.trim();

  if (!secret) {
    throw new ConfigError('JWT_TOKEN environment variable is not set.');
  }

  return secret;
}

/**
 * Signs a short-lived JWT access token using HMAC-SHA256 (`HS256`).
 *
 * @param claims - User identity claims to embed in the token.
 * @returns Signed JWT string and expiration metadata.
 */
export function signAccessToken(claims: AccessTokenClaims): {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
} {
  const secret = getJwtSecret();

  const accessToken = jwt.sign(
    {
      email: claims.email,
      ...(claims.displayName === undefined
        ? {}
        : { displayName: claims.displayName }),
    },
    secret,
    {
      algorithm: 'HS256',
      subject: claims.sub,
      issuer: JWT_ISSUER,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
    }
  );

  return {
    accessToken,
    tokenType: 'Bearer',
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  };
}

/**
 * Verifies a JWT access token and validates required identity claims.
 *
 * @param token - Raw JWT token string.
 * @returns Verified token payload.
 * @throws {HttpError} 401 Unauthorized when the token is invalid, expired, or malformed.
 */
export function verifyAccessToken(token: string): VerifiedAccessTokenPayload {
  const secret = getJwtSecret();

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
    });

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      typeof decoded.sub !== 'string' ||
      typeof (decoded as Record<string, unknown>).email !== 'string'
    ) {
      throw HttpError.unauthorized('Invalid access token payload.');
    }

    return decoded as VerifiedAccessTokenPayload;
  } catch (error) {
    if (error instanceof HttpError || error instanceof ConfigError) {
      throw error;
    }

    if (error instanceof jwt.TokenExpiredError) {
      throw HttpError.unauthorized('Access token has expired.', {
        cause: error,
      });
    }

    throw HttpError.unauthorized('Invalid access token.', {
      cause: error,
    });
  }
}
