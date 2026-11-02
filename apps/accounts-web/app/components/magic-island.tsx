import { useEffect, useState } from 'react';

import axios from 'axios';

import { Box, Typography } from '@mui/material';

import { baseUrl } from '../lib/api';

interface HealthResponse {
  status?: string;
  services?: {
    database?: {
      status?: string;
      error?: string;
    };
  };
}

export function MagicIsland() {
  const [isDatabaseUnreachable, setIsDatabaseUnreachable] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkDatabaseHealth = async () => {
      try {
        const response = await axios.get<HealthResponse>(`${baseUrl}/health`, {
          timeout: 5000,
        });
        const dbStatus = response.data?.services?.database?.status;
        const isHealthy =
          response.data?.status === 'ok' &&
          (dbStatus === 'up' || dbStatus === 'ok');

        if (isMounted) {
          setIsDatabaseUnreachable(!isHealthy);
        }
      } catch {
        if (isMounted) {
          setIsDatabaseUnreachable(true);
        }
      }
    };

    void checkDatabaseHealth();
    const intervalId = globalThis.setInterval(() => {
      void checkDatabaseHealth();
    }, 10_000);

    return () => {
      isMounted = false;
      globalThis.clearInterval(intervalId);
    };
  }, []);

  if (!isDatabaseUnreachable) {
    return null;
  }

  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        position: 'fixed',
        top: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: (theme) => theme.zIndex.snackbar,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        minHeight: 38,
        px: 2.25,
        py: 0.875,
        borderRadius: 999,
        bgcolor: 'rgba(44, 8, 12, 0.88)',
        backgroundImage:
          'linear-gradient(135deg, rgba(255, 59, 48, 0.28) 0%, rgba(180, 18, 28, 0.36) 100%)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        border: '1px solid rgba(255, 69, 58, 0.45)',
        boxShadow:
          '0 10px 30px rgba(0, 0, 0, 0.55), 0 0 20px rgba(255, 59, 48, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.14)',
        color: '#ffecec',
        userSelect: 'none',
        transition:
          'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s ease',
        animation: 'islandDropIn 0.45s cubic-bezier(0.32, 0.72, 0, 1)',
        '@keyframes islandDropIn': {
          '0%': {
            opacity: 0,
            transform: 'translateX(-50%) translateY(-16px) scale(0.85)',
          },
          '100%': {
            opacity: 1,
            transform: 'translateX(-50%) translateY(0) scale(1)',
          },
        },
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 10,
          height: 10,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            bgcolor: '#ff453a',
            opacity: 0.75,
            animation: 'islandPulse 1.8s ease-out infinite',
            '@keyframes islandPulse': {
              '0%': {
                transform: 'scale(1)',
                opacity: 0.8,
              },
              '100%': {
                transform: 'scale(2.4)',
                opacity: 0,
              },
            },
          }}
        />
        <Box
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: '#ff453a',
            boxShadow: '0 0 8px #ff453a',
          }}
        />
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontSize: '0.8125rem',
          letterSpacing: '-0.01em',
          lineHeight: 1.2,
          color: '#fff5f5',
          whiteSpace: 'nowrap',
        }}
      >
        Database unreachable
      </Typography>
    </Box>
  );
}
