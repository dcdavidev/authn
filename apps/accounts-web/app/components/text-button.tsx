import type { ElementType } from 'react';

import {
  Link as RouterLink,
  type LinkProps as RouterLinkProps,
} from 'react-router';

import {
  Button,
  type ButtonProps,
  type SxProps,
  type Theme,
} from '@mui/material';

const baseTextButtonSx: SxProps<Theme> = {
  textTransform: 'none',
  fontWeight: 600,
};

export type TextButtonProps<C extends ElementType = 'button'> = ButtonProps<
  C,
  { component?: C; to?: RouterLinkProps['to'] }
>;

export function TextButton<C extends ElementType = 'button'>({
  variant = 'text',
  color = 'secondary',
  component,
  to,
  sx,
  ...props
}: TextButtonProps<C>) {
  const resolvedComponent = component ?? (to ? RouterLink : undefined);

  return (
    <Button
      variant={variant}
      color={color}
      component={resolvedComponent as ElementType}
      to={to}
      sx={
        Array.isArray(sx)
          ? [baseTextButtonSx, ...sx]
          : sx
            ? [baseTextButtonSx, sx]
            : baseTextButtonSx
      }
      {...props}
    />
  );
}
