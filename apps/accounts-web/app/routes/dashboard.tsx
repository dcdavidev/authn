import { Form, redirect } from 'react-router';

import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { ShimmerButton } from '../components/shimmer-button';
import { api } from '../lib/api';
import {
  clearAuthCookieHeader,
  type CurrentUserApiResponse,
  getAccessToken,
} from '../lib/auth.server';
import type { Route } from './+types/dashboard';

export function meta(_args: Route.MetaArgs) {
  return [
    { title: 'Account Dashboard - Authn Accounts' },
    {
      name: 'description',
      content: 'Manage your Authn Account profile and active session.',
    },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const accessToken = await getAccessToken(request);

  if (!accessToken) {
    return redirect('/');
  }

  try {
    const response = await api.get<CurrentUserApiResponse>('/auth/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return {
      user: response.data.user,
      scheme: response.data.scheme,
    };
  } catch {
    return redirect('/', {
      headers: {
        'Set-Cookie': await clearAuthCookieHeader(),
      },
    });
  }
}

export async function action({ request }: Route.ActionArgs) {
  const accessToken = await getAccessToken(request);

  if (accessToken) {
    try {
      await api.post(
        '/auth/logout',
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch {
      // Clear local session cookie even if API is unreachable
    }
  }

  return redirect('/', {
    headers: {
      'Set-Cookie': await clearAuthCookieHeader(),
    },
  });
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { user, scheme } = loaderData;

  return (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 4,
      }}
    >
      <Stack spacing={3.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
          }}
        >
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
                {user.displayName ? `Welcome, ${user.displayName}` : 'Welcome'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={`Authenticated (${scheme} JWT)`}
            color="success"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Divider />

        <Stack spacing={2}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Account ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {user.id}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Email Address
            </Typography>
            <Typography variant="body2">{user.email}</Typography>
          </Box>

          {user.displayName && (
            <Box>
              <Typography variant="caption" color="text.secondary">
                Display Name
              </Typography>
              <Typography variant="body2">{user.displayName}</Typography>
            </Box>
          )}
        </Stack>

        <Box
          component={Form}
          method="post"
          sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}
        >
          <ShimmerButton type="submit">Sign out</ShimmerButton>
        </Box>
      </Stack>
    </Paper>
  );
}
