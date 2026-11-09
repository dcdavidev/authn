import { createCookie } from 'react-router';

const DEFAULT_MAX_AGE_SECONDS = 3600;

export interface AuthenticatedUserProfile {
  id: string;
  email: string;
  displayName: string | null;
  emailVerifiedAt: string | null;
  mfaEnabled: boolean;
  createdAt: string;
}

export interface LoginApiResponse {
  message: string;
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  user: AuthenticatedUserProfile;
}

export interface CurrentUserApiResponse {
  user: AuthenticatedUserProfile;
  scheme: 'Bearer' | 'Basic';
}

export const accessTokenCookie = createCookie('authn_access_token', {
  httpOnly: true,
  path: '/',
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: DEFAULT_MAX_AGE_SECONDS,
});

/**
 * Extracts the stored JWT access token from the incoming request's Cookie header.
 *
 * @param request - Incoming web request.
 * @returns Raw JWT access token string or `null` when absent.
 */
export async function getAccessToken(request: Request): Promise<string | null> {
  const cookieHeader = request.headers.get('Cookie');
  const token = (await accessTokenCookie.parse(cookieHeader)) as unknown;
  return typeof token === 'string' && token.length > 0 ? token : null;
}

/**
 * Serializes a `Set-Cookie` header storing the provided JWT access token.
 *
 * @param accessToken - Signed JWT access token string.
 * @param maxAge - Cookie lifetime in seconds.
 * @returns Serialized `Set-Cookie` header string.
 */
export async function createAuthCookieHeader(
  accessToken: string,
  maxAge = DEFAULT_MAX_AGE_SECONDS
): Promise<string> {
  return accessTokenCookie.serialize(accessToken, { maxAge });
}

/**
 * Serializes a `Set-Cookie` header that expires and clears the JWT access token cookie.
 *
 * @returns Serialized `Set-Cookie` header string.
 */
export async function clearAuthCookieHeader(): Promise<string> {
  return accessTokenCookie.serialize('', { maxAge: 0 });
}

/**
 * Encodes an email and password pair into a Base64 HTTP Basic authentication token.
 *
 * @param email - User email address.
 * @param password - Plain-text user password.
 * @returns Base64-encoded `&lt;email>:&lt;password>` string.
 */
export function encodeBasicCredentials(
  email: string,
  password: string
): string {
  return Buffer.from(`${email}:${password}`, 'utf8').toString('base64');
}
