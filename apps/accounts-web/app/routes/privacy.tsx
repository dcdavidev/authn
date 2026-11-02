import { Avatar, Box, Divider, Paper, Stack, Typography } from '@mui/material';

import { TextButton } from '../components/text-button';
import type { Route } from './+types/privacy';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Privacy Policy - Authn Accounts' },
    {
      name: 'description',
      content:
        'Learn how Authn Accounts minimizes and protects your personal data.',
    },
  ];
}

export default function Privacy() {
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
              Privacy Policy
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Data minimization and identity protection in Authn Accounts
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack spacing={2.5}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Pseudonymous Identifiers
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Each account is assigned a non-enumerable UUIDv7 identifier so
              personal information is never exposed in URLs, tokens, or
              application logs.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Data Minimization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              We only store core authentication data (email address, password
              hash, verification timestamp, and MFA status) along with an
              optional display name that can be erased or anonymized at any
              time.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Credential Security
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plain-text passwords are never stored or logged. Credentials are
              cryptographically hashed before persistence and sensitive fields
              are automatically redacted from server logs.
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
