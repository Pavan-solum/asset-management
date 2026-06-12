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
} from '@mui/material';
import DevicesIcon from '@mui/icons-material/Devices';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/storeHooks';
import { login, clearError } from '../../store/authSlice';

const demoAccounts = [
  { email: 'admin@acme.com', role: 'Tenant Admin', desc: 'Full access' },
  { email: 'itadmin@acme.com', role: 'IT Admin', desc: 'No user/settings delete' },
  { email: 'viewer@acme.com', role: 'Viewer', desc: 'Read-only' },
];

export function LoginPage() {
  const [email, setEmail] = useState('admin@acme.com');
  const [password, setPassword] = useState('Demo@123456');
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const error = useAppSelector((s) => s.auth.error);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) navigate('/');
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    dispatch(login({ email, password }));
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Demo@123456');
    dispatch(clearError());
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D47A1 0%, #1565C0 40%, #00897B 100%)',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 440, width: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <DevicesIcon sx={{ color: 'white', fontSize: 32 }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              IT Asset Platform
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Sign in to Acme Corp demo tenant
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
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
            <Button type="submit" fullWidth variant="contained" size="large" sx={{ mt: 3, py: 1.5 }}>
              Sign In
            </Button>
          </Box>

          <Divider sx={{ my: 3 }}>
            <Chip label="Demo accounts" size="small" />
          </Divider>

          <Stack spacing={1}>
            {demoAccounts.map((acc) => (
              <Button
                key={acc.email}
                variant="outlined"
                fullWidth
                onClick={() => fillDemo(acc.email)}
                sx={{ justifyContent: 'space-between', textTransform: 'none', py: 1 }}
              >
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" fontWeight={600}>
                    {acc.role}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {acc.email}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {acc.desc}
                </Typography>
              </Button>
            ))}
          </Stack>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2}>
            Password for all demo accounts: Demo@123456
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
