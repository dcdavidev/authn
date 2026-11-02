import { Avatar, Box, Divider, Paper, Stack, Typography } from '@mui/material';

import { TextButton } from '../components/text-button';
import type { Route } from './+types/terms';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Terms of Service - Authn Accounts' },
    {
      name: 'description',
      content: 'Terms of use for Authn Accounts and centralized SSO services.',
    },
  ];
}

export default function Terms() {
  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 4,
      }}
    >
      <Stack spacing={3.5}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
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
              sx={{ fontWeight: 500, letterSpacing: -0.5 }}
            >
              Terms of Service
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Conditions for using Authn Accounts and SSO playground services
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              1. Purpose of the Service
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Authn Accounts is a modern authentication and centralized Single
              Sign-On (SSO) environment designed for secure identity management
              and authentication workflows.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              2. Account Responsibilities
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You are responsible for maintaining the confidentiality of your
              credentials and enabling Multi-Factor Authentication (MFA) where
              available to protect access to your account.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              3. Acceptable Use
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Automated abuse, credential stuffing, or unauthorized attempts to
              probe authentication endpoints are prohibited and subject to
              rate-limiting and access revocation.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
          <TextButton to="/">Back to Sign in</TextButton>
        </Box>
      </Stack>
    </Paper>
  );
}
