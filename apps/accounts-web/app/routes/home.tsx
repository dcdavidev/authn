import { Form } from 'react-router';

import {
  Avatar,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

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
                    placeholder="email*"
                    autoComplete="email"
                    autoFocus
                    required
                    fullWidth
                    slotProps={{
                      htmlInput: {
                        'aria-label': 'Email',
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        bgcolor: 'rgba(255, 255, 255, 0.08)',
                        borderRadius: 2,
                        fontSize: '1.125rem',
                        transition: 'background-color 0.2s ease',
                        '&:hover, &.Mui-focused': {
                          bgcolor: 'rgba(255, 255, 255, 0.12)',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        py: 2,
                        px: 2.5,
                      },
                      '& .MuiOutlinedInput-notchedOutline': {
                        border: 'none',
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
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disableElevation
                    sx={(theme) => ({
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3.5,
                      borderRadius: 999,
                      border: '2px solid transparent',
                      backgroundImage: `linear-gradient(${theme.palette.primary.main}, ${theme.palette.primary.main}), linear-gradient(110deg, #8a6400 0%, #d4af37 20%, #ffd700 40%, #fffacd 50%, #ffd700 60%, #d4af37 80%, #8a6400 100%)`,
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                      backgroundSize: '100% 100%, 250% 100%',
                      boxShadow: '0 0 12px rgba(255, 215, 0, 0.25)',
                      animation: 'goldShimmer 3s linear infinite',
                      transition: 'box-shadow 0.3s ease, transform 0.2s ease',
                      '@keyframes goldShimmer': {
                        '0%': {
                          backgroundPosition: '0 0, 200% 0',
                        },
                        '100%': {
                          backgroundPosition: '0 0, -50% 0',
                        },
                      },
                      '&:hover': {
                        backgroundImage: `linear-gradient(${theme.palette.primary.dark}, ${theme.palette.primary.dark}), linear-gradient(110deg, #8a6400 0%, #d4af37 20%, #ffd700 40%, #fffacd 50%, #ffd700 60%, #d4af37 80%, #8a6400 100%)`,
                        boxShadow: '0 0 18px rgba(255, 215, 0, 0.45)',
                      },
                    })}
                  >
                    Login
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Paper>

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
            href="/help"
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            Help
          </Link>
          <Link
            href="/privacy"
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            variant="caption"
            color="text.secondary"
            underline="hover"
          >
            Terms
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
