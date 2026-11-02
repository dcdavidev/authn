import {
  index,
  layout,
  route,
  type RouteConfig,
} from '@react-router/dev/routes';

export default [
  layout('layouts/auth-layout.tsx', [
    index('routes/home.tsx'),
    route('register', 'routes/register.tsx'),
    route('help', 'routes/help.tsx'),
    route('privacy', 'routes/privacy.tsx'),
    route('terms', 'routes/terms.tsx'),
  ]),
] satisfies RouteConfig;
