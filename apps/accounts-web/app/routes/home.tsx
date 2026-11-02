import { Form } from 'react-router';

import { Avatar, Box, Link, Paper, Stack, Typography } from '@mui/material';

import { ShimmerButton } from '../components/shimmer-button';
import { TextButton } from '../components/text-button';
import { TextField } from '../components/text-field';
import type { Route } from './+types/home';

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

export default function Home() {
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
              Sign in
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Use your Authn Account
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1.5, opacity: 0.8 }}
            >
              A playground for modern authentication methods and centralized
              SSO.
            </Typography>
          </Box>
        </Stack>

        <Box component={Form} method="post" noValidate>
          <Stack spacing={4} sx={{ pt: { xs: 0, md: 7 } }}>
            <Box>
              <TextField
                id="email"
                name="email"
                type="email"
                label="Email"
                autoComplete="email"
                autoFocus
                required
              />
              <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
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
              <ShimmerButton type="submit">Login</ShimmerButton>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Paper>
  );
}
