/**
 * @file Auth API router aggregating authentication route handlers.
 * @module routes/auth
 */

import { Router } from 'express';

import { authController } from '../controllers/index.js';
import { authenticate } from '../middlewares/index.js';

/**
 * Authentication router mounted under /auth.
 */
export const authRouter: Router = Router();

/**
 * POST /auth/validate
 * Full registration payload validation endpoint.
 */
authRouter.post('/validate', authController.validateRegistrationInput);

/**
 * POST /auth/validate/email
 * Email format and availability validation endpoint.
 */
authRouter.post('/validate/email', authController.validateEmailInput);

/**
 * POST /auth/validate/password
 * Password complexity and strength validation endpoint.
 */
authRouter.post('/validate/password', authController.validatePasswordInput);

/**
 * POST /auth/register
 * User registration endpoint.
 */
authRouter.post('/register', authController.registerUser);

/**
 * POST /auth/login
 * User login endpoint (accepts HTTP Basic credentials or JSON body and returns a Bearer JWT).
 */
authRouter.post('/login', authController.loginUser);

/**
 * GET /auth/me
 * Authenticated user profile endpoint (protected via Bearer JWT or HTTP Basic authentication).
 */
authRouter.get('/me', authenticate, authController.getCurrentUser);

/**
 * POST /auth/logout
 * User logout endpoint.
 */
authRouter.post('/logout', authController.logoutUser);
