# @authn/app-core

Reusable, production-ready Express server package with built-in security middlewares, structured Pino logging, health checks, and graceful shutdown.

## Features

- **Security Hardened**: Preconfigured Helmet, CORS, and HPP (HTTP Parameter Pollution) protection.
- **DDoS / Brute-force Protection**: Rate limiting with Draft-8 headers.
- **Request Parsing**: JSON and URL-encoded body parsing with configurable limits.
- **Structured Logging**: High-performance Pino logger with `pino-pretty` in development and structured JSON in production. Sensitive fields (passwords, tokens, cookies, auth headers) redacted automatically.
- **Kubernetes / Cloud Ready**: Health check routes (`/health`, `/health/live`, `/health/ready`) with custom readiness probes.
- **Graceful Shutdown**: Drains in-flight connections on `SIGTERM` / `SIGINT`, closes idle keep-alive connections, runs custom cleanup hooks (e.g. database disconnects), and enforces a safety timeout.
- **Centralized Error Handling**: Standardized JSON error responses and `HttpError` helper class.

---

## Installation

Inside the monorepo workspace:

```bash
pnpm --filter @authn/app-core@workspace:* < your-app > add
```

---

## Quick Start

### 1. Minimal Server (1 Call)

```typescript
import { createServer } from '@authn/app-core';

const { app, server } = createServer({
  serviceName: 'My Service',
  routes: (app) => {
    app.get('/api/ping', (req, res) => {
      res.json({ message: 'pong' });
    });
  },
});
```

### 2. Standard Modular Setup

```typescript
import type { Express } from 'express';
import type { Server } from 'node:http';
import { createApp, startServer } from '@authn/app-core';
import { myRouter } from './routes.js';

export const app: Express = createApp({
  serviceName: 'Accounts Service',
  routes: myRouter,
});

export const server: Server = startServer(app, {
  serviceName: 'Accounts Service',
  cleanupHooks: [
    async () => {
      // Disconnect database, redis, etc.
    },
  ],
});
```

---

## Configuration

The package automatically loads configuration from environment variables or custom overrides:

| Variable               | Default                       | Description                                               |
| ---------------------- | ----------------------------- | --------------------------------------------------------- |
| `PORT`                 | `3000`                        | Port the server listens on                                |
| `HOST`                 | `localhost`                   | Host address                                              |
| `NODE_ENV`             | `development`                 | Runtime environment (`development`, `production`, `test`) |
| `LOG_LEVEL`            | `debug` (dev) / `info` (prod) | Pino log level                                            |
| `SHUTDOWN_TIMEOUT_MS`  | `10000`                       | Milliseconds before forcing exit during graceful shutdown |
| `BODY_LIMIT`           | `1mb`                         | Max request body size limit                               |
| `CORS_ORIGIN`          | `*`                           | Allowed CORS origins (comma-separated or `*`)             |
| `RATE_LIMIT_WINDOW_MS` | `900000` (15m)                | Window time for rate limiting                             |
| `RATE_LIMIT_MAX`       | `100`                         | Max requests per IP per window                            |

You can also override any configuration directly in code:

```typescript
import { createApp, loadConfig } from '@authn/app-core';

const customConfig = loadConfig({
  port: 8080,
  bodyLimit: '10mb',
  corsOrigin: ['https://example.com'],
});

const app = createApp({ config: customConfig });
```

---

## Customizing Endpoints & Middlewares

### Custom Readiness Check

```typescript
import { createApp } from '@authn/app-core';

const app = createApp({
  healthOptions: {
    isReady: async () => {
      // Return false (503) if database is not reachable
      return await db.ping();
    },
    extraInfo: () => ({
      dbStatus: 'connected',
    }),
  },
});
```

### Error Handling

Throw `HttpError` anywhere in your routes or middleware:

```typescript
import { HttpError } from '@authn/app-core';

app.get('/users/:id', (req, res) => {
  const user = findUser(req.params.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  res.json(user);
});
```
