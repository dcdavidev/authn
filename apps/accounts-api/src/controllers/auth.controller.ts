/**
 * @file Auth controller handling authentication-related requests and responses.
 * @module controllers/auth.controller
 */

import type { NextFunction, Request, Response } from 'express';

import { HttpError } from 'wnodex/errors';

import { signAccessToken } from '../lib/jwt.js';
import { hashPassword } from '../lib/password.js';
import { prisma } from '../lib/prisma-client.js';
import {
  validateDisplayName,
  validateEmail,
  validatePassword,
} from '../lib/validation.js';
import {
  extractBasicCredentials,
  verifyUserCredentials,
} from '../middlewares/auth.middleware.js';

/**
 * Request body payload sent by the registration form.
 */
export interface RegisterRequestBody {
  displayName?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
}

/**
 * Request body payload sent by the login form.
 */
export interface LoginRequestBody {
  email?: unknown;
  password?: unknown;
}

/**
 * Controller for handling authentication-related requests and responses.
 */
export class AuthController {
  /**
   * POST /auth/validate/email
   * Validates an email address format and checks whether it is available.
   *
   * @param req - Express request object containing `{ email }`.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  validateEmailInput = async (
    req: Request<Record<string, never>, unknown, { email?: unknown }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const emailResult = validateEmail(req.body?.email);

      if (!emailResult.valid || !emailResult.normalizedEmail) {
        res.status(200).json({
          valid: false,
          available: false,
          message: emailResult.message,
        });
        return;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: emailResult.normalizedEmail },
        select: { id: true },
      });

      const available = !existingUser;

      res.status(200).json({
        valid: available,
        available,
        normalizedEmail: emailResult.normalizedEmail,
        ...(available
          ? {}
          : { message: 'An account with this email already exists.' }),
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/validate/password
   * Evaluates password complexity and strength (`weak` | `fair` | `good` | `strong`).
   *
   * @param req - Express request object containing `{ password, confirmPassword? }`.
   * @param res - Express response object.
   */
  validatePasswordInput = (
    req: Request<
      Record<string, never>,
      unknown,
      { password?: unknown; confirmPassword?: unknown }
    >,
    res: Response
  ): void => {
    const { password, confirmPassword } = req.body ?? {};
    const passwordResult = validatePassword(password);

    const passwordsMatch =
      confirmPassword === undefined
        ? undefined
        : typeof password === 'string' &&
          typeof confirmPassword === 'string' &&
          password === confirmPassword;

    const valid =
      passwordResult.valid && (passwordsMatch === undefined || passwordsMatch);

    res.status(200).json({
      ...passwordResult,
      valid,
      ...(passwordsMatch === undefined ? {} : { passwordsMatch }),
      message:
        passwordResult.message ??
        (passwordsMatch === false ? 'Passwords do not match.' : undefined),
    });
  };

  /**
   * POST /auth/validate
   * Validates the full registration payload (`displayName`, `email`, `password`, `confirmPassword`).
   *
   * @param req - Express request object containing registration fields.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  validateRegistrationInput = async (
    req: Request<Record<string, never>, unknown, RegisterRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { displayName, email, password, confirmPassword } =
        req.body ?? ({} as RegisterRequestBody);

      const displayNameResult = validateDisplayName(displayName);
      const emailResult = validateEmail(email);
      const passwordResult = validatePassword(password);

      let emailAvailable = false;
      if (emailResult.valid && emailResult.normalizedEmail) {
        const existingUser = await prisma.user.findUnique({
          where: { email: emailResult.normalizedEmail },
          select: { id: true },
        });
        emailAvailable = !existingUser;
      }

      const passwordsMatch =
        typeof password === 'string' &&
        typeof confirmPassword === 'string' &&
        password === confirmPassword;

      const valid =
        displayNameResult.valid &&
        emailResult.valid &&
        emailAvailable &&
        passwordResult.valid &&
        passwordsMatch;

      res.status(200).json({
        valid,
        fields: {
          displayName: displayNameResult,
          email: {
            ...emailResult,
            valid: emailResult.valid && emailAvailable,
            available: emailAvailable,
            message:
              emailResult.message ??
              (emailAvailable
                ? undefined
                : 'An account with this email already exists.'),
          },
          password: passwordResult,
          confirmPassword: {
            valid: passwordsMatch,
            ...(passwordsMatch ? {} : { message: 'Passwords do not match.' }),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/register
   * Registers a new user account from the registration form payload.
   *
   * @param req - Express request object containing registration fields.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  registerUser = async (
    req: Request<Record<string, never>, unknown, RegisterRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { displayName, email, password, confirmPassword } =
        req.body ?? ({} as RegisterRequestBody);

      const displayNameResult = validateDisplayName(displayName);
      if (!displayNameResult.valid) {
        throw HttpError.badRequest(
          displayNameResult.message ?? 'Invalid display name.'
        );
      }

      const emailResult = validateEmail(email);
      if (!emailResult.valid || !emailResult.normalizedEmail) {
        throw HttpError.badRequest(
          emailResult.message ?? 'Please provide a valid email address.'
        );
      }

      const passwordResult = validatePassword(password);
      if (!passwordResult.valid || typeof password !== 'string') {
        throw HttpError.badRequest(
          passwordResult.message ?? 'Invalid password.',
          {
            context: {
              strength: passwordResult.strength,
              score: passwordResult.score,
              checks: passwordResult.checks,
            },
          }
        );
      }

      if (
        confirmPassword !== undefined &&
        (typeof confirmPassword !== 'string' || password !== confirmPassword)
      ) {
        throw HttpError.badRequest('Passwords do not match.');
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: emailResult.normalizedEmail },
        select: { id: true },
      });

      if (existingUser) {
        throw HttpError.conflict('An account with this email already exists.');
      }

      const passwordHash = await hashPassword(password);

      const user = await prisma.user.create({
        data: {
          email: emailResult.normalizedEmail,
          passwordHash,
          displayName: displayNameResult.normalizedDisplayName,
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          emailVerifiedAt: true,
          mfaEnabled: true,
          createdAt: true,
        },
      });

      res.status(201).json({
        message: 'User registered successfully.',
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/login
   * Authenticates an existing user account via HTTP Basic header or `{ email, password }` JSON body
   * and issues a signed Bearer JWT access token.
   *
   * @param req - Express request object containing Basic auth header or `{ email, password }` body.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  loginUser = async (
    req: Request<Record<string, never>, unknown, LoginRequestBody>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const basicCredentials = extractBasicCredentials(
        req.headers.authorization
      );
      const email = basicCredentials?.email ?? req.body?.email;
      const password = basicCredentials?.password ?? req.body?.password;

      const user = await verifyUserCredentials(email, password);

      const { accessToken, tokenType, expiresIn } = signAccessToken({
        sub: user.id,
        email: user.email,
        displayName: user.displayName,
      });

      res.status(200).json({
        message: 'User logged in successfully.',
        accessToken,
        tokenType,
        expiresIn,
        user,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/me
   * Returns the currently authenticated user profile resolved via Bearer JWT or HTTP Basic authentication.
   *
   * @param req - Express request object populated by `authenticate` middleware.
   * @param res - Express response object.
   * @param next - Express next middleware function.
   */
  getCurrentUser = (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.auth) {
        throw HttpError.unauthorized('Authentication required.');
      }

      res.status(200).json({
        user: req.auth.user,
        scheme: req.auth.scheme,
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * Logs out the current user session.
   *
   * @param _req - Express request object.
   * @param res - Express response object.
   */
  logoutUser = (_req: Request, res: Response): void => {
    res.status(200).json({ message: 'User logged out successfully.' });
  };
}

/**
 * Singleton instance of AuthController.
 */
export const authController: AuthController = new AuthController();
