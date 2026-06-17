import {
  Box,
  Button,
  ButtonProps,
  CircularProgress,
  LinearProgress,
  Typography,
  alpha,
} from '@mui/material';
import { APP_NAME } from '../constants/brand';
import { useAppSelector } from '../hooks/storeHooks';

export function LoaderSpinner({ size = 40, label }: { size?: number; label?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <CircularProgress size={size} thickness={4} />
      {label && (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          {label}
        </Typography>
      )}
    </Box>
  );
}

export function PageLoader({ message = 'Loading…' }: { message?: string }) {
  return (
    <Box
      sx={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: 3,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress size={32} />
      </Box>
      <Typography variant="h6" fontWeight={600}>
        {APP_NAME}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function GlobalLoadingBar() {
  const loading = useAppSelector((s) => s.ui.loadingCount > 0);
  const message = useAppSelector((s) => s.ui.loadingMessage);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 2,
      }}
    >
      <LinearProgress />
      {message && (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: 'center',
            py: 0.5,
            bgcolor: 'background.paper',
            borderBottom: 1,
            borderColor: 'divider',
            color: 'text.secondary',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export function DialogLoader({ message = 'Please wait…' }: { message?: string }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.72),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        borderRadius: 'inherit',
      }}
    >
      <LoaderSpinner label={message} />
    </Box>
  );
}

type LoadingButtonProps = ButtonProps & {
  loading?: boolean;
  loadingLabel?: string;
};

export function LoadingButton({
  loading = false,
  loadingLabel,
  disabled,
  children,
  startIcon,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : startIcon}
    >
      {loading && loadingLabel ? loadingLabel : children}
    </Button>
  );
}
