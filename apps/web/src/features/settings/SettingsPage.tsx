import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert,
  Switch,
  FormControlLabel,
  TextField,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import CloudIcon from '@mui/icons-material/Cloud';
import GroupIcon from '@mui/icons-material/Group';
import StorageIcon from '@mui/icons-material/Storage';
import { useTenant, useAuthUser, usePermissions } from '../../hooks/storeHooks';
import { PageHeader } from '../../components/PageHeader';
import { useThemeMode } from '../../context/ThemeModeContext';
import { APP_NAME, COMPANY_EMAIL_DOMAIN } from '../../constants/brand';
import { isApiEnabled } from '../../services/api/config';
import { checkApiHealth } from '../../services/api/client';
import { changePassword } from '../../services/api/auth';
import { ApiError } from '../../services/api/client';
import { LoadingButton } from '../../components/Loader';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

const demoUsers = [
  { name: 'Vasanth', email: `admin@${COMPANY_EMAIL_DOMAIN}`, role: 'Tenant Admin' },
  { name: 'Pavan', email: `itadmin@${COMPANY_EMAIL_DOMAIN}`, role: 'IT Admin' },
  { name: 'Lisa Viewer', email: `viewer@${COMPANY_EMAIL_DOMAIN}`, role: 'Viewer' },
];

const roadmapFeatures = [
  'SSO / SAML / LDAP / Entra ID',
  'MSP parent-child tenant hierarchy',
  'Stripe billing integration',
  'Email notification preferences',
  'Custom roles & permissions',
  'White-label branding',
];

export function SettingsPage() {
  const tenant = useTenant();
  const user = useAuthUser();
  const { can } = usePermissions();
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<string | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!isApiEnabled()) {
      setDbConnected(null);
      return;
    }
    checkApiHealth().then((health) => setDbConnected(health.ok));
  }, []);

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle={`${APP_NAME} tenant configuration and preferences`}
        breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Settings' }]}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Appearance
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControlLabel
                control={<Switch checked={isDark} onChange={() => toggleMode()} color="primary" />}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isDark ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Dark mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isDark ? 'On — easier on the eyes at night' : 'Off — light theme active'}
                      </Typography>
                    </Box>
                  </Box>
                }
                sx={{ ml: 0, alignItems: 'flex-start' }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <StorageIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                Backend
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SettingRow
                label="API mode"
                value={
                  <Chip
                    label={isApiEnabled() ? 'Postgres (enabled)' : 'Local demo (in-memory)'}
                    color={isApiEnabled() ? 'success' : 'default'}
                    size="small"
                  />
                }
              />
              {isApiEnabled() && (
                <SettingRow
                  label="Database"
                  value={
                    dbConnected === null ? (
                      'Checking…'
                    ) : (
                      <Chip
                        label={dbConnected ? 'Connected' : 'Disconnected'}
                        color={dbConnected ? 'success' : 'error'}
                        size="small"
                      />
                    )
                  }
                />
              )}
              <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                See docs/12-backend-setup.md for Neon or Supabase setup.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Organization
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SettingRow label="Company Name" value={tenant?.name ?? '—'} />
              <SettingRow label="Tenant Slug" value={tenant?.slug ?? '—'} />
              <SettingRow
                label="Subscription Plan"
                value={<Chip label={tenant?.plan} color="primary" size="small" />}
              />
              <SettingRow label="Timezone" value="America/New_York" />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Profile
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <SettingRow label="Name" value={`${user?.firstName} ${user?.lastName}`} />
              <SettingRow label="Email" value={user?.email ?? '—'} />
              <SettingRow label="Role" value={user?.role?.replace('_', ' ') ?? '—'} />
              <SettingRow label="MFA" value={<Chip label="Coming in Phase 2" size="small" variant="outlined" />} />
              {isApiEnabled() && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                    Change password
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    label="Current password"
                    size="small"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  <TextField
                    fullWidth
                    type="password"
                    label="New password"
                    size="small"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    sx={{ mb: 1.5 }}
                  />
                  {passwordMsg && (
                    <Alert severity={passwordMsg.startsWith('Password updated') ? 'success' : 'error'} sx={{ mb: 1.5 }}>
                      {passwordMsg}
                    </Alert>
                  )}
                  <LoadingButton
                    variant="contained"
                    size="small"
                    loading={passwordLoading}
                    disabled={!currentPassword || !newPassword}
                    onClick={async () => {
                      setPasswordLoading(true);
                      setPasswordMsg(null);
                      try {
                        await changePassword(currentPassword, newPassword);
                        setPasswordMsg('Password updated successfully.');
                        setCurrentPassword('');
                        setNewPassword('');
                      } catch (e) {
                        setPasswordMsg(e instanceof ApiError ? e.message : 'Password change failed');
                      } finally {
                        setPasswordLoading(false);
                      }
                    }}
                  >
                    Update password
                  </LoadingButton>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {can('settings:write') && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <GroupIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                  Demo Users
                </Typography>
                <List dense>
                  {demoUsers.map((u) => (
                    <ListItem key={u.email} sx={{ px: 0 }}>
                      <ListItemText primary={u.name} secondary={`${u.email} · ${u.role}`} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <CloudIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: 20 }} />
                Enterprise Features (Roadmap)
              </Typography>
              <List dense>
                {roadmapFeatures.map((f) => (
                  <ListItem key={f} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <LockIcon fontSize="small" color="action" />
                    </ListItemIcon>
                    <ListItemText primary={f} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Alert severity="info" icon={<CheckCircleIcon />}>
            This is a Phase 1 demo UI with client-side data. Production will connect to NestJS API,
            PostgreSQL with row-level security, and JWT authentication.
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
}

function SettingRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} component="div">
        {value}
      </Typography>
    </Box>
  );
}
