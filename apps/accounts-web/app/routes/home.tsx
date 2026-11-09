import { useState } from 'react';

import { data, Form, redirect } from 'react-router';

import axios from 'axios';

import {
  Alert,
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { IconEye, IconEyeOff } from '@tabler/icons-react';

import { ShimmerButton } from '../components/shimmer-button';
import { TextButton } from '../components/text-button';
import { TextField } from '../components/text-field';
import { api } from '../lib/api';
import {
  createAuthCookieHeader,
  type CurrentUserApiResponse,
  encodeBasicCredentials,
  getAccessToken,
  type LoginApiResponse,
} from '../lib/auth.server';
import type { Route } from './+types/home';

interface EmailValidationResponse {
  valid: boolean;
  available: boolean;
  normalizedEmail?: string;
  message?: string;
}

interface LoginActionData {
  step: 'email' | 'password';
  email: string;
  error?: string;
  fields?: {
    email?: string;
    password?: string;
  };
}

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Sign in - Authn Accounts' },
    {
      name: 'description',
      content:
        'A playground for modern authentication methods and centralized SSO.',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return null;
  }

  try {
    await api.get<CurrentUserApiResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return redirect('/dashboard');
  } catch {
    return null;
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const intent = String(formData.get('intent') ?? 'email');
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');

  if (intent === 'email') {
    if (!email) {
      return data<LoginActionData>(
        {
          step: 'email',
          email,
          fields: {
            email: 'Email is required.',
          },
        },
        { status: 400 }
      );
    }

    try {
      const validation = await api.post<EmailValidationResponse>(
        '/auth/validate/email',
        { email }
      );

      if (!validation.data.normalizedEmail) {
        return data<LoginActionData>(
          {
            step: 'email',
            email,
            fields: {
              email:
                validation.data.message ??
                'Please provide a valid email address.',
            },
          },
          { status: 400 }
        );
      }

      if (validation.data.available) {
        return data<LoginActionData>(
          {
            step: 'email',
            email: validation.data.normalizedEmail,
            fields: {
              email: 'No account found with this email address.',
            },
          },
          { status: 404 }
        );
      }

      return data<LoginActionData>({
        step: 'password',
        email: validation.data.normalizedEmail,
      });
    } catch (error) {
      let message = 'Unable to verify email. Please try again.';

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message = error.response?.data?.message ?? message;
      }

      return data<LoginActionData>(
        {
          step: 'email',
          email,
          error: message,
        },
        { status: 400 }
      );
    }
  }

  if (!email) {
    return data<LoginActionData>(
      {
        step: 'email',
        email: '',
        fields: {
          email: 'Email is required.',
        },
      },
      { status: 400 }
    );
  }

  if (!password) {
    return data<LoginActionData>(
      {
        step: 'password',
        email,
        fields: {
          password: 'Password is required.',
        },
      },
      { status: 400 }
    );
  }

  try {
    const basicToken = encodeBasicCredentials(email, password);
    const loginResponse = await api.post<LoginApiResponse>(
      '/auth/login',
      {
        email,
        password,
      },
      {
        headers: {
          Authorization: `Basic ${basicToken}`,
        },
      }
    );

    const setCookieHeader = await createAuthCookieHeader(
      loginResponse.data.accessToken,
      loginResponse.data.expiresIn
    );

    return redirect('/dashboard', {
      headers: {
        'Set-Cookie': setCookieHeader,
      },
    });
  } catch (error) {
    let message = 'Unable to sign in. Please try again.';
    let status = 400;

    if (axios.isAxiosError<{ message?: string }>(error)) {
      message = error.response?.data?.message ?? message;
      status = error.response?.status ?? 400;
    }

    return data<LoginActionData>(
      {
        step: 'password',
        email,
        error: message,
      },
      { status }
    );
  }
}

export default function Home({ actionData }: Route.ComponentProps) {
  const [lastActionData, setLastActionData] = useState(actionData);
  const [stepOverride, setStepOverride] = useState<'email' | 'password' | null>(
    null
  );
  const [emailInput, setEmailInput] = useState(actionData?.email ?? '');
  const [emailState, setEmailState] = useState<{
    error: boolean;
    helperText?: string;
  } | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  if (actionData !== lastActionData) {
    setLastActionData(actionData);
    setStepOverride(null);
    setEmailState(null);
    setPasswordError(undefined);
    setShowPassword(false);
    if (actionData?.email) {
      setEmailInput(actionData.email);
    }
  }

  const currentStep = stepOverride ?? actionData?.step ?? 'email';
  const isPasswordStep = currentStep === 'password';
  const showServerState = stepOverride === null;
  const activeEmail = emailInput.trim() || actionData?.email || '';

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

      if (!response.data.normalizedEmail) {
        setEmailState({
          error: true,
          helperText:
            response.data.message ?? 'Please provide a valid email address.',
        });
        return;
      }

      if (response.data.available) {
        setEmailState({
          error: true,
          helperText: 'No account found with this email address.',
        });
        return;
      }

      setEmailState({
        error: false,
        helperText: undefined,
      });
    } catch {
      // Fall back to form submit validation if server is unreachable
    }
  };

  const handleBackToEmail = () => {
    setStepOverride('email');
    setEmailState(null);
    setPasswordError(undefined);
    setShowPassword(false);
  };

  const serverEmailError = showServerState
    ? actionData?.fields?.email
    : undefined;
  const resolvedEmailError = emailState?.error ?? Boolean(serverEmailError);
  const resolvedEmailHelperText =
    emailState === null ? serverEmailError : emailState.helperText;

  const serverPasswordError = showServerState
    ? actionData?.fields?.password
    : undefined;
  const resolvedPasswordError = passwordError ?? serverPasswordError;

  const serverAlertError = showServerState ? actionData?.error : undefined;

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
              {isPasswordStep ? 'Welcome' : 'Sign in'}
            </Typography>
            {isPasswordStep ? (
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={activeEmail}
                  variant="outlined"
                  onClick={handleBackToEmail}
                  sx={{
                    maxWidth: '100%',
                    fontWeight: 500,
                    borderRadius: 999,
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body1" color="text.secondary">
                Use your Authn Account
              </Typography>
            )}
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, opacity: 0.8 }}
            >
              {isPasswordStep
                ? 'Enter your password to continue to your Authn Account.'
                : 'A playground for modern authentication methods and centralized SSO.'}
            </Typography>
          </Box>
        </Stack>

        <Box component={Form} method="post" noValidate>
          <Stack spacing={4} sx={{ pt: { xs: 0, md: 7 } }}>
            {serverAlertError && (
              <Alert severity="error" variant="outlined">
                {serverAlertError}
              </Alert>
            )}

            {isPasswordStep ? (
              <>
                <input type="hidden" name="intent" value="login" />
                <input type="hidden" name="email" value={activeEmail} />

                <Box>
                  <TextField
                    key="password"
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    label="Enter your password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    error={Boolean(resolvedPasswordError)}
                    helperText={resolvedPasswordError}
                    onChange={(event) => {
                      if (event.target.value.length > 0 && passwordError) {
                        setPasswordError(undefined);
                      }
                    }}
                    onBlur={(event) => {
                      if (event.target.value.length === 0) {
                        setPasswordError('Password is required.');
                      }
                    }}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: 0.5 }}>
                            <IconButton
                              aria-label={
                                showPassword ? 'Hide password' : 'Show password'
                              }
                              onClick={() => {
                                setShowPassword((prev) => !prev);
                              }}
                              edge="end"
                            >
                              {showPassword ? (
                                <IconEyeOff size={20} />
                              ) : (
                                <IconEye size={20} />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <Box
                    sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <Link
                      href="/forgot-password"
                      underline="hover"
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      Forgot password?
                    </Link>
                  </Box>
                </Box>

                <Stack
                  spacing={2}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pt: 1,
                  }}
                >
                  <TextButton type="button" onClick={handleBackToEmail}>
                    Use another account
                  </TextButton>
                  <ShimmerButton type="submit">Login</ShimmerButton>
                </Stack>
              </>
            ) : (
              <>
                <input type="hidden" name="intent" value="email" />

                <Box>
                  <TextField
                    key="email"
                    id="email"
                    name="email"
                    type="email"
                    label="Email"
                    autoComplete="email"
                    autoFocus
                    required
                    value={emailInput}
                    error={resolvedEmailError}
                    helperText={resolvedEmailHelperText}
                    onChange={(event) => {
                      setEmailInput(event.target.value);
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
                  <Box
                    sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}
                  >
                    <Link
                      href="/forgot-email"
                      underline="hover"
                      variant="body2"
                      sx={{ fontWeight: 600 }}
                    >
                      Forgot email?
                    </Link>
                  </Box>
                </Box>

                <Stack
                  spacing={2}
                  direction="row"
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pt: 1,
                  }}
                >
                  <TextButton to="/register">Create an account</TextButton>
                  <ShimmerButton type="submit">Next</ShimmerButton>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
