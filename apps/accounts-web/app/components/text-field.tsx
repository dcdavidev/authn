import {
  type SxProps,
  TextField as MuiTextField,
  type TextFieldProps,
  type Theme,
} from '@mui/material';

export function TextField({
  fullWidth = true,
  label,
  required = false,
  sx,
  ...props
}: TextFieldProps) {
  const hasLabel = Boolean(label);

  const baseTextFieldSx: SxProps<Theme> = {
    '& .MuiInputLabel-root': {
      fontSize: '1.125rem',
      transform: 'translate(20px, 16px) scale(1)',
      '&.MuiInputLabel-shrink': {
        transform: 'translate(20px, 6px) scale(0.75)',
      },
    },
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
      pt: hasLabel ? 3 : 2,
      pb: hasLabel ? 1 : 2,
      px: 2.5,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      border: 'none',
    },
  };

  return (
    <MuiTextField
      label={label}
      required={required}
      fullWidth={fullWidth}
      sx={
        Array.isArray(sx)
          ? [baseTextFieldSx, ...sx]
          : sx
            ? [baseTextFieldSx, sx]
            : baseTextFieldSx
      }
      {...props}
    />
  );
}
