import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Chip,
  Stack,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { clearError, setSession, setLoginError, setPendingSession } from '../../store/authSlice';
import { APP_NAME, APP_TAGLINE, COMPANY_EMAIL_DOMAIN, COMPANY_NAME } from '../../constants/brand';
import { ThemeModeToggle } from '../../components/ThemeModeToggle';
import { LoadingButton } from '../../components/Loader';
import { withMinDelay } from '../../hooks/useAsyncAction';
import { isApiEnabled } from '../../services/api/config';
import { apiLogin, changePassword } from '../../services/api/auth';
import { ApiError, checkApiHealth, loginErrorMessage } from '../../services/api/client';
import { getHomeRouteForRole } from '../../utils/routing';



const features = [
  { icon: <Inventory2Icon fontSize="small" />, text: 'Track assets, warranties & assignments' },
  { icon: <SecurityIcon fontSize="small" />, text: 'Role-based access for your team' },
  { icon: <AnalyticsIcon fontSize="small" />, text: 'Dashboard insights & audit trail' },
];

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiWarning, setApiWarning] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isWide = useMediaQuery(theme.breakpoints.up('md'));
  const error = useAppSelector((s) => s.auth.error);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const requirePasswordSetup = useAppSelector((s) => s.auth.requirePasswordSetup);
  const pendingUserEmail = useAppSelector((s) => s.auth.pendingUserEmail);
  const role = useAppSelector((s) => s.auth.user?.role);
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from || getHomeRouteForRole(role);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, role, location]);

  useEffect(() => {
    if (!isApiEnabled()) return;
    void checkApiHealth().then((result) => {
      setApiWarning(result.ok ? null : (result.message ?? 'Backend unavailable'));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    
    if (requirePasswordSetup) {
      if (password !== confirmPassword) {
        dispatch(setLoginError('Passwords do not match'));
        return;
      }
      if (password.length < 6) {
        dispatch(setLoginError('Password must be at least 6 characters'));
        return;
      }
      setLoading(true);
      try {
        await changePassword('', password);
        dispatch(setSession({
          user: (window as any).__pendingUser,
          tenant: (window as any).__pendingTenant,
          token: (window as any).__pendingToken,
        }));
      } catch (err) {
        dispatch(setLoginError(err instanceof Error ? err.message : 'Failed to set password'));
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const data = await apiLogin(email, password);
      if (data.requirePasswordSetup) {
        // Store pending session data for use after password is set
        (window as any).__pendingUser = data.user;
        (window as any).__pendingTenant = data.tenant;
        (window as any).__pendingToken = data.token;
        // Store the token so changePassword API call is authenticated
        (await import('../../services/api/auth')).storeToken(data.token);
        dispatch(setPendingSession({ user: data.user, tenant: data.tenant, token: data.token }));
      } else {
        dispatch(
          setSession({
            user: data.user,
            tenant: data.tenant,
            token: data.token,
          }),
        );
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? loginErrorMessage(err.status, err.message)
          : 'Sign in failed';
      dispatch(setLoginError(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 1 }}>
        <ThemeModeToggle />
      </Box>
      {isWide && (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            px: 6,
            py: 4,
            background: 'linear-gradient(145deg, #0D47A1 0%, #1565C0 45%, #00897B 100%)',
            color: 'white',
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2.5,
              bgcolor: alpha('#fff', 0.15),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <DevicesIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h3" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
            {APP_NAME}
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, mb: 4, maxWidth: 420 }}>
            {APP_TAGLINE} for modern IT teams
          </Typography>
          <Stack spacing={2}>
            {features.map((f) => (
              <Box key={f.text} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: 2,
                    bgcolor: alpha('#fff', 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {f.icon}
                </Box>
                <Typography variant="body1" sx={{ opacity: 0.95 }}>
                  {f.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 4 },
          maxWidth: isWide ? 520 : '100%',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 440,
            borderRadius: 3,
            boxShadow: isWide
              ? (theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.4)'
                : '0 8px 32px rgba(26, 35, 50, 0.08)')
              : undefined,
          }}
          elevation={isWide ? 0 : 1}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            {!isWide && (
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: 2.5,
                    bgcolor: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1.5,
                    boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
                  }}
                >
                  <DevicesIcon sx={{ color: 'white', fontSize: 28 }} />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  {APP_NAME}
                </Typography>
              </Box>
            )}

            <Typography variant={isWide ? 'h5' : 'h6'} fontWeight={700} gutterBottom>
              Sign in
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {COMPANY_NAME} portal
            </Typography>

            {apiWarning && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {apiWarning}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {requirePasswordSetup ? (
              <Box component="form" onSubmit={handleSubmit}>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Welcome, <strong>{pendingUserEmail}</strong>! Since this is your first time logging in, please set a password for your account.
                </Typography>
                <TextField
                  fullWidth
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Confirm Password"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  margin="normal"
                  required
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, py: 1.5 }}
                  loading={loading}
                  loadingLabel="Setting password…"
                >
                  Set Password & Sign In
                </LoadingButton>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  margin="normal"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
                <TextField
                  fullWidth
                  label="Password (optional for new employees)"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  margin="normal"
                  autoComplete="current-password"
                  disabled={loading}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, py: 1.5 }}
                  loading={loading}
                  loadingLabel="Signing in…"
                >
                  Sign In
                </LoadingButton>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
