import { useRef, useState } from 'react';

import { data, Form, redirect } from 'react-router';

import axios from 'axios';

import { Alert, Avatar, Box, Paper, Stack, Typography } from '@mui/material';

import { ShimmerButton } from '../components/shimmer-button';
import { TextButton } from '../components/text-button';
import { TextField } from '../components/text-field';
import { api } from '../lib/api';
import type { Route } from './+types/register';

interface FieldValidationState {
  valid: boolean;
  message?: string;
}

interface EmailValidationResponse extends FieldValidationState {
  available: boolean;
  normalizedEmail?: string;
}

interface PasswordValidationResponse extends FieldValidationState {
  strength: 'weak' | 'fair' | 'good' | 'strong';
  score: 0 | 1 | 2 | 3 | 4;
  passwordsMatch?: boolean;
  checks: {
    minLength: boolean;
    hasLowercase: boolean;
    hasUppercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
  };
}

interface ValidateRegistrationResponse {
  valid: boolean;
  fields: {
    displayName: FieldValidationState;
    email: EmailValidationResponse;
    password: PasswordValidationResponse;
    confirmPassword: FieldValidationState;
  };
}

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Create account - Authn Accounts' },
    {
      name: 'description',
      content:
        'Create an Authn Account to access modern authentication methods and centralized SSO.',
    },
  ];
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const displayName = String(formData.get('displayName') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  try {
    const validation = await api.post<ValidateRegistrationResponse>(
      '/auth/validate',
      {
        displayName: displayName || undefined,
        email,
        password,
        confirmPassword,
      }
    );

    if (!validation.data.valid) {
      return data(
        {
          error: undefined,
          fields: validation.data.fields,
        },
        { status: 400 }
      );
    }

    await api.post('/auth/register', {
      displayName: displayName || undefined,
      email,
      password,
      confirmPassword,
    });

    return redirect('/');
  } catch (error) {
    let message = 'Unable to register account. Please try again.';

    if (axios.isAxiosError<{ message?: string }>(error)) {
      message = error.response?.data?.message ?? message;
    }

    return data(
      {
        error: message,
        fields: undefined,
      },
      { status: 400 }
    );
  }
}

export default function Register({ actionData }: Route.ComponentProps) {
  const [displayNameError, setDisplayNameError] = useState<
    string | undefined
  >();
  const [emailState, setEmailState] = useState<{
    error: boolean;
    helperText?: string;
  } | null>(null);
  const [passwordState, setPasswordState] = useState<{
    error: boolean;
    helperText?: string;
  } | null>(null);
  const [confirmPasswordState, setConfirmPasswordState] = useState<{
    error: boolean;
    helperText?: string;
  } | null>(null);

  const passwordValueRef = useRef('');
  const confirmPasswordValueRef = useRef('');

  const handleEmailBlur = async (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const email = event.target.value.trim();

    if (!email) {
      setEmailState({
        error: true,
        helperText: 'Email is required.',
      });
      return;
    }

    try {
      const response = await api.post<EmailValidationResponse>(
        '/auth/validate/email',
        { email }
      );

      setEmailState({
        error: !response.data.valid,
        helperText: response.data.message,
      });
    } catch {
      // Fall back to form submit validation if server is unreachable
    }
  };

  const validatePasswordsOnServer = async (
    password: string,
    confirmPassword: string,
    showConfirmMismatch: boolean
  ) => {
    try {
      const response = await api.post<PasswordValidationResponse>(
        '/auth/validate/password',
        {
          password,
          confirmPassword: showConfirmMismatch ? confirmPassword : undefined,
        }
      );

      const { checks, strength, message, passwordsMatch } = response.data;
      const isPasswordValid =
        checks.minLength &&
        [
          checks.hasLowercase,
          checks.hasUppercase,
          checks.hasNumber,
          checks.hasSpecialChar,
        ].filter(Boolean).length >= 3;

      setPasswordState({
        error: !isPasswordValid,
        helperText: isPasswordValid
          ? `Password strength: ${strength}`
          : (message ?? `Password strength: ${strength}`),
      });

      if (showConfirmMismatch) {
        setConfirmPasswordState({
          error: passwordsMatch === false,
          helperText:
            passwordsMatch === false ? 'Passwords do not match.' : undefined,
        });
      }
    } catch {
      // Fall back to form submit validation if server is unreachable
    }
  };

  const serverFields = actionData?.fields;

  const resolvedDisplayNameError =
    displayNameError ??
    (serverFields?.displayName.valid === false
      ? serverFields.displayName.message
      : undefined);

  const resolvedEmailError =
    emailState?.error ?? (serverFields ? !serverFields.email.valid : false);
  const resolvedEmailHelperText =
    emailState === null ? serverFields?.email.message : emailState.helperText;

  const resolvedPasswordError =
    passwordState?.error ??
    (serverFields ? !serverFields.password.valid : false);
  const resolvedPasswordHelperText =
    passwordState === null
      ? serverFields?.password.message
      : passwordState.helperText;

  const resolvedConfirmPasswordError =
    confirmPasswordState?.error ??
    (serverFields ? !serverFields.confirmPassword.valid : false);
  const resolvedConfirmPasswordHelperText =
    confirmPasswordState === null
      ? serverFields?.confirmPassword.message
      : confirmPasswordState.helperText;

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 4,
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 4, md: 6 },
          alignItems: 'start',
        }}
      >
        <Stack spacing={2.5}>
          <Avatar
            src="/logo.png"
            alt="Authn"
            sx={{
              width: 48,
              height: 48,
            }}
          />
          <Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 500, letterSpacing: -0.5, mb: 1 }}
            >
              Create account
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create your Authn Account
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, opacity: 0.8 }}
            >
              Enter your details to register for centralized SSO and modern
              authentication.
            </Typography>
          </Box>
        </Stack>

        <Box component={Form} method="post" noValidate>
          <Stack spacing={2.5} sx={{ pt: { xs: 0, md: 2 } }}>
            {actionData?.error && (
              <Alert severity="error" variant="outlined">
                {actionData.error}
              </Alert>
            )}

            <TextField
              id="displayName"
              name="displayName"
              type="text"
              label="Name"
              autoComplete="name"
              autoFocus
              error={Boolean(resolvedDisplayNameError)}
              helperText={resolvedDisplayNameError}
              onChange={(event) => {
                if (event.target.value.trim().length > 150) {
                  setDisplayNameError(
                    'Display name must not exceed 150 characters.'
                  );
                } else {
                  setDisplayNameError(undefined);
                }
              }}
              slotProps={{
                htmlInput: {
                  maxLength: 150,
                },
              }}
            />

            <TextField
              id="email"
              name="email"
              type="email"
              label="Email"
              autoComplete="email"
              required
              error={resolvedEmailError}
              helperText={resolvedEmailHelperText}
              onChange={() => {
                if (emailState?.error) {
                  setEmailState(null);
                }
              }}
              onBlur={(event) => {
                void handleEmailBlur(event);
              }}
              slotProps={{
                htmlInput: {
                  maxLength: 320,
                },
              }}
            />

            <TextField
              id="password"
              name="password"
              type="password"
              label="Password"
              autoComplete="new-password"
              required
              error={resolvedPasswordError}
              helperText={resolvedPasswordHelperText}
              onChange={(event) => {
                const nextPassword = event.target.value;
                passwordValueRef.current = nextPassword;
                void validatePasswordsOnServer(
                  nextPassword,
                  confirmPasswordValueRef.current,
                  confirmPasswordValueRef.current.length > 0
                );
              }}
              onBlur={(event) => {
                const nextPassword = event.target.value;
                passwordValueRef.current = nextPassword;
                void validatePasswordsOnServer(
                  nextPassword,
                  confirmPasswordValueRef.current,
                  confirmPasswordValueRef.current.length > 0
                );
              }}
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              autoComplete="new-password"
              required
              error={resolvedConfirmPasswordError}
              helperText={resolvedConfirmPasswordHelperText}
              onChange={(event) => {
                const nextConfirm = event.target.value;
                confirmPasswordValueRef.current = nextConfirm;
                if (
                  passwordValueRef.current.length > 0 ||
                  nextConfirm.length > 0
                ) {
                  void validatePasswordsOnServer(
                    passwordValueRef.current,
                    nextConfirm,
                    true
                  );
                }
              }}
              onBlur={(event) => {
                const nextConfirm = event.target.value;
                confirmPasswordValueRef.current = nextConfirm;
                void validatePasswordsOnServer(
                  passwordValueRef.current,
                  nextConfirm,
                  true
                );
              }}
            />

            <Stack
              spacing={2}
              direction="row"
              sx={{
                alignItems: 'center',
                justifyContent: 'flex-end',
                pt: 1.5,
              }}
            >
              <TextButton to="/">Sign in instead</TextButton>
              <ShimmerButton type="submit">Register</ShimmerButton>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
