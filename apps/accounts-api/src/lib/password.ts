/**
 * @file Password hashing and constant-time verification utilities using Node's scrypt KDF.
 * @module lib/password
 */

import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from 'node:crypto';
import { promisify } from 'node:util';

/**
 * Promise-based wrapper around Node's built-in `crypto.scrypt` key derivation function (KDF).
 *
 * `scrypt` is a CPU- and memory-hard password hashing algorithm designed to make
 * brute-force and specialized hardware (GPU) attacks computationally expensive.
 */
const scrypt = promisify(scryptCallback);

const SCRYPT_KEY_LENGTH = 64;

/**
 * Hashes a plain-text password using Node's built-in scrypt KDF.
 *
 * @param password - Plain-text password to hash.
 * @returns Encoded password hash string (`scrypt$&lt;salt>$&lt;derivedKey>`).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(
    password,
    salt,
    SCRYPT_KEY_LENGTH
  )) as Buffer;
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plain-text password against an encoded scrypt password hash.
 *
 * @param password - Plain-text password to verify.
 * @param storedHash - Encoded `scrypt$&lt;salt>$&lt;derivedKey>` password hash string.
 * @returns `true` when the password matches the stored hash, otherwise `false`.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  const [algorithm, salt, keyHex] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !salt || !keyHex) {
    return false;
  }

  const storedKey = Buffer.from(keyHex, 'hex');
  if (storedKey.length !== SCRYPT_KEY_LENGTH) {
    return false;
  }

  const derivedKey = (await scrypt(
    password,
    salt,
    SCRYPT_KEY_LENGTH
  )) as Buffer;

  return timingSafeEqual(storedKey, derivedKey);
}
