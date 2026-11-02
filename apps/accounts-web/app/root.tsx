import '@fontsource-variable/inter';

import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from 'react-router';

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Container,
  CssBaseline,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import './app.css';

import type { Route } from './+types/root';
import { CookieConsent } from './components/cookie-consent';
import { theme } from './lib/theme';

export const links: Route.LinksFunction = () => [
  {
    rel: 'apple-touch-icon',
    sizes: '180x180',
    href: '/apple-touch-icon.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '32x32',
    href: '/favicon-32x32.png',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '16x16',
    href: '/favicon-16x16.png',
  },
  { rel: 'manifest', href: '/site.webmanifest' },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CookieConsent />
          {children}
        </ThemeProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <Box>
      {isNavigating && (
        <LinearProgress
          arias-label="Loading..."
          color="primary"
          sx={{ display: isNavigating ? 'block' : 'none' }}
        />
      )}
      <Outlet />
    </Box>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let status: number | undefined;
  let title = 'Something went wrong';
  let details = 'An unexpected error occurred.';
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    title = error.status === 404 ? 'Page not found' : 'Request error';
    details =
      error.status === 404
        ? 'The requested page could not be found.'
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Container
      component="main"
      maxWidth="md"
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          p: { xs: 3, sm: 5 },
          width: '100%',
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography
              variant="overline"
              color="primary"
              sx={{ fontWeight: 700, letterSpacing: 1.5 }}
            >
              {status ? `Error ${status}` : 'Application Error'}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 800, mt: 0.5 }}
            >
              {title}
            </Typography>
          </Box>

          <Alert
            severity={status === 404 ? 'warning' : 'error'}
            variant="outlined"
          >
            <AlertTitle sx={{ fontWeight: 600 }}>Details</AlertTitle>
            {details}
          </Alert>

          {stack && (
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1, fontWeight: 600 }}
              >
                Stack Trace (Development Only)
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'background.default',
                  overflowX: 'auto',
                  maxHeight: 320,
                  borderRadius: 2,
                }}
              >
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    lineHeight: 1.6,
                    color: 'error.light',
                  }}
                >
                  <code>{stack}</code>
                </Box>
              </Paper>
            </Box>
          )}

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{ pt: 1 }}
          >
            <Button component={Link} to="/" variant="contained" size="large">
              Back to Home
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                globalThis.location.reload();
              }}
            >
              Reload Page
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
}
