import { Avatar, Box, Divider, Paper, Stack, Typography } from '@mui/material';

import { TextButton } from '../components/text-button';
import type { Route } from './+types/help';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Help - Authn Accounts' },
    {
      name: 'description',
      content: 'Help and support for your Authn Account and centralized SSO.',
    },
  ];
}

export default function Help() {
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
              Help Center
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Support and frequently asked questions for Authn Accounts
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              How do I sign in to my Authn Account?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your registered email address on the sign-in screen to
              proceed with your configured authentication method or centralized
              Single Sign-On (SSO).
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              How do I create a new account?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select &ldquo;Create an account&rdquo; from the sign-in page,
              provide your email address, an optional display name, and a strong
              password to register your identity.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              What if the database status indicator appears?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If the top status indicator reports &ldquo;Database
              unreachable&rdquo;, ensure the local PostgreSQL service and
              Accounts API server are running and healthy.
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
