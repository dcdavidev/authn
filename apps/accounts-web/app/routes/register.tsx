import { Form } from 'react-router';

import { Avatar, Box, Paper, Stack, Typography } from '@mui/material';

import { ShimmerButton } from '../components/shimmer-button';
import { TextButton } from '../components/text-button';
import { TextField } from '../components/text-field';
import type { Route } from './+types/register';

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

export default function Register() {
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
            <TextField
              id="displayName"
              name="displayName"
              type="text"
              label="Name"
              autoComplete="name"
              autoFocus
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
            />

            <TextField
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirm password"
              autoComplete="new-password"
              required
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
