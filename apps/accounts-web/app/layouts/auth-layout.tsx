import { Link as RouterLink, Outlet } from 'react-router';

import { Box, Container, Link, Stack } from '@mui/material';

import { showCookiePreferences } from '../components/cookie-consent';
import { MagicIsland } from '../components/magic-island';

export default function AuthLayout() {
  return (
    <>
      <MagicIsland />
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
        }}
      >
        <Container maxWidth="md" disableGutters>
          <Outlet />

          <Stack
            direction="row"
            spacing={3}
            sx={{
              mt: 2,
              px: 1,
              justifyContent: { xs: 'center', sm: 'flex-end' },
            }}
          >
            <Link
              component={RouterLink}
              to="/help"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Help
            </Link>
            <Link
              component={RouterLink}
              to="/privacy"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Privacy
            </Link>
            <Link
              component={RouterLink}
              to="/terms"
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Terms
            </Link>
            <Link
              component="button"
              type="button"
              onClick={showCookiePreferences}
              variant="caption"
              color="text.secondary"
              underline="hover"
            >
              Cookies
            </Link>
          </Stack>
        </Container>
      </Box>
    </>
  );
}
