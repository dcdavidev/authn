/**
 * @file Input validation utilities for authentication and registration payloads.
 * @module lib/validation
 */

import emailRegex from 'email-regex';

export const EMAIL_MAX_LENGTH = 320;
export const DISPLAY_NAME_MAX_LENGTH = 150;
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_STRONG_LENGTH = 12;

/**
 * Exact email validation regular expression powered by `email-regex`.
 */
export const EXACT_EMAIL_REGEX: RegExp = emailRegex({
  exact: true,
  allowSingleLabelDomain: false,
});

/**
 * Individual regular expressions for password complexity criteria.
 */
export const PASSWORD_MIN_LENGTH_REGEX = /^.{8,}$/;
export const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_NUMBER_REGEX = /\d/;
export const PASSWORD_SPECIAL_CHAR_REGEX =
  /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;

/**
 * Composite regular expression requiring at least 8 characters, one lowercase
 * letter, one uppercase letter, one number, and one special character.
 */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]).{8,}$/;

/**
 * Password strength classification returned by `validatePassword`.
 */
export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

/**
 * Breakdown of individual password policy checks.
 */
export interface PasswordChecks {
  minLength: boolean;
  hasLowercase: boolean;
  hasUppercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

/**
 * Result of validating an email address.
 */
export interface EmailValidationResult {
  valid: boolean;
  normalizedEmail?: string;
  message?: string;
}

/**
 * Result of validating a password and evaluating its strength.
 */
export interface PasswordValidationResult {
  valid: boolean;
  strength: PasswordStrength;
  score: 0 | 1 | 2 | 3 | 4;
  checks: PasswordChecks;
  message?: string;
}

/**
 * Result of validating an optional display name.
 */
export interface DisplayNameValidationResult {
  valid: boolean;
  normalizedDisplayName: string | null;
  message?: string;
}

/**
 * Validates and normalizes an email address using `email-regex`.
 *
 * @param email - Raw email input to validate.
 * @returns Validation result with normalized email when valid.
 */
export function validateEmail(email: unknown): EmailValidationResult {
  if (typeof email !== 'string' || email.trim().length === 0) {
    return {
      valid: false,
      message: 'Email is required.',
    };
  }

  const normalizedEmail = email.trim().toLowerCase();

  if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
    return {
      valid: false,
      message: `Email must not exceed ${EMAIL_MAX_LENGTH} characters.`,
    };
  }

  if (!EXACT_EMAIL_REGEX.test(normalizedEmail)) {
    return {
      valid: false,
      message: 'Please provide a valid email address.',
    };
  }

  return {
    valid: true,
    normalizedEmail,
  };
}

/**
 * Validates a password against complexity regular expressions and computes its strength level.
 *
 * @param password - Raw password input to validate.
 * @returns Validation result including strength (`weak` | `fair` | `good` | `strong`), score, and criteria checks.
 */
export function validatePassword(password: unknown): PasswordValidationResult {
  if (typeof password !== 'string' || password.length === 0) {
    return {
      valid: false,
      strength: 'weak',
      score: 0,
      checks: {
        minLength: false,
        hasLowercase: false,
        hasUppercase: false,
        hasNumber: false,
        hasSpecialChar: false,
      },
      message: 'Password is required.',
    };
  }

  const checks: PasswordChecks = {
    minLength: PASSWORD_MIN_LENGTH_REGEX.test(password),
    hasLowercase: PASSWORD_LOWERCASE_REGEX.test(password),
    hasUppercase: PASSWORD_UPPERCASE_REGEX.test(password),
    hasNumber: PASSWORD_NUMBER_REGEX.test(password),
    hasSpecialChar: PASSWORD_SPECIAL_CHAR_REGEX.test(password),
  };

  const varietyCount = [
    checks.hasLowercase,
    checks.hasUppercase,
    checks.hasNumber,
    checks.hasSpecialChar,
  ].filter(Boolean).length;

  let score: 0 | 1 | 2 | 3 | 4;
  let strength: PasswordStrength;

  if (!checks.minLength || varietyCount <= 1) {
    score = checks.minLength ? 1 : 0;
    strength = 'weak';
  } else if (varietyCount === 2) {
    score = 2;
    strength = 'fair';
  } else if (
    varietyCount === 3 ||
    (STRONG_PASSWORD_REGEX.test(password) &&
      password.length < PASSWORD_STRONG_LENGTH)
  ) {
    score = 3;
    strength = 'good';
  } else {
    score = 4;
    strength = 'strong';
  }

  if (!checks.minLength) {
    return {
      valid: false,
      strength,
      score,
      checks,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
    };
  }

  if (varietyCount < 3) {
    return {
      valid: false,
      strength,
      score,
      checks,
      message:
        'Password is too weak. Include at least three of: uppercase, lowercase, number, and special character.',
    };
  }

  return {
    valid: true,
    strength,
    score,
    checks,
  };
}

/**
 * Validates and normalizes an optional user display name.
 *
 * @param displayName - Raw display name input to validate.
 * @returns Validation result with normalized display name or `null`.
 */
export function validateDisplayName(
  displayName: unknown
): DisplayNameValidationResult {
  if (displayName === undefined || displayName === null || displayName === '') {
    return {
      valid: true,
      normalizedDisplayName: null,
    };
  }

  if (typeof displayName !== 'string') {
    return {
      valid: false,
      normalizedDisplayName: null,
      message: 'Display name must be a string.',
    };
  }

  const trimmed = displayName.trim();
  if (trimmed.length === 0) {
    return {
      valid: true,
      normalizedDisplayName: null,
    };
  }

  if (trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      valid: false,
      normalizedDisplayName: null,
      message: `Display name must not exceed ${DISPLAY_NAME_MAX_LENGTH} characters.`,
    };
  }

  return {
    valid: true,
    normalizedDisplayName: trimmed,
  };
}
