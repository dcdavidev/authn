import {
  Button,
  type ButtonProps,
  type SxProps,
  type Theme,
} from '@mui/material';

const baseShimmerButtonSx: SxProps<Theme> = (theme) => ({
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
});

export function ShimmerButton({
  variant = 'contained',
  size = 'large',
  disableElevation = true,
  sx,
  ...props
}: ButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disableElevation={disableElevation}
      sx={
        Array.isArray(sx)
          ? [baseShimmerButtonSx, ...sx]
          : sx
            ? [baseShimmerButtonSx, sx]
            : baseShimmerButtonSx
      }
      {...props}
    />
  );
}
