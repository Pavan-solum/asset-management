import { useEffect, useState } from 'react';
import {
  Box,
  Chip,
  Grid,
  Alert,
  Switch,
  FormControlLabel,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useTenant, useAuthUser, usePermissions } from '../../hooks/storeHooks';
import { PageHeader } from '../../components/PageHeader';
import { useThemeMode } from '../../context/ThemeModeContext';
import { APP_NAME } from '../../constants/brand';
import { isApiEnabled } from '../../services/api/config';
import { checkApiHealth } from '../../services/api/client';
import { BillingCard } from './BillingCard';
import { ChangePasswordCard } from './ChangePasswordCard';
import {
  SettingRow,
  SettingsCard,
  SettingsCardGridItem,
  SettingsSection,
} from './SettingsCard';

export function SettingsPage() {
  const theme = useTheme();
  const tenant = useTenant();
  const user = useAuthUser();
  const { can, role } = usePermissions();
  const canViewBilling = isApiEnabled() && (can('settings:write') || role === 'platform_admin');
  const { mode, toggleMode } = useThemeMode();
  const isDark = mode === 'dark';
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isApiEnabled()) {
      setDbConnected(null);
      return;
    }
    checkApiHealth().then((health) => setDbConnected(health.ok));
  }, []);

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <PageHeader
            title="Settings"
            subtitle={`${APP_NAME} tenant configuration and preferences`}
            breadcrumbs={[{ label: 'Dashboard', to: '/' }, { label: 'Settings' }]}
          />
        </Grid>

        {canViewBilling && (
          <Grid item xs={12}>
            {role === 'platform_admin' && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Viewing subscription for <strong>{tenant?.name ?? 'this organization'}</strong>. Tenant admins manage
                billing for their own organization from this page.
              </Alert>
            )}
            <BillingCard />
          </Grid>
        )}

        <SettingsSection
          title="Account"
          description="Your identity and organization details"
        />

        <SettingsCardGridItem>
          <SettingsCard
            title="Your Profile"
            subtitle="Signed-in user information"
            icon={<PersonOutlinedIcon fontSize="small" />}
          >
            <Box sx={{ flex: 1 }}>
              <SettingRow label="Name" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || '—'} />
              <SettingRow label="Email" value={user?.email ?? '—'} />
              <SettingRow label="Role" value={user?.role?.replace('_', ' ') ?? '—'} />
              <SettingRow
                label="MFA"
                value={<Chip label="Coming in Phase 2" size="small" variant="outlined" />}
              />
            </Box>
          </SettingsCard>
        </SettingsCardGridItem>

        <SettingsCardGridItem>
          <SettingsCard
            title="Organization"
            subtitle="Tenant and workspace settings"
            icon={<BusinessOutlinedIcon fontSize="small" />}
          >
            <Box sx={{ flex: 1 }}>
              <SettingRow label="Company Name" value={tenant?.name ?? '—'} />
              <SettingRow label="Tenant Slug" value={tenant?.slug ?? '—'} />
              <SettingRow
                label="Subscription Plan"
                value={<Chip label={tenant?.plan ?? '—'} color="primary" size="small" />}
              />
              <SettingRow label="Timezone" value="America/New_York" />
            </Box>
          </SettingsCard>
        </SettingsCardGridItem>

        {isApiEnabled() && (
          <>
            <SettingsSection
              title="Security"
              description="Protect your account access"
            />
            <Grid item xs={12} sx={{ display: 'flex' }}>
              <ChangePasswordCard />
            </Grid>
          </>
        )}

        <SettingsSection
          title="Preferences & system"
          description="Appearance and backend connectivity"
        />

        <SettingsCardGridItem>
          <SettingsCard
            title="Appearance"
            subtitle="How the app looks on your device"
            icon={isDark ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <SettingRow
                  label="Theme"
                  value={<Chip label={isDark ? 'Dark' : 'Light'} size="small" color="primary" variant="outlined" />}
                />
                <FormControlLabel
                  control={<Switch checked={isDark} onChange={() => toggleMode()} color="primary" />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={600}>
                        Dark mode
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {isDark ? 'On — easier on the eyes at night' : 'Off — light theme active'}
                      </Typography>
                    </Box>
                  }
                  sx={{ ml: 0, mt: 1, alignItems: 'flex-start' }}
                />
              </Box>
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  border: '1px dashed',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Language, date format, and display density options will appear here in a future update.
                </Typography>
              </Box>
            </Box>
          </SettingsCard>
        </SettingsCardGridItem>

        <SettingsCardGridItem>
          <SettingsCard
            title="Backend"
            subtitle="API and database status"
            icon={<StorageIcon fontSize="small" />}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
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
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 3 }}>
                See docs/12-backend-setup.md for Neon or Supabase setup.
              </Typography>
            </Box>
          </SettingsCard>
        </SettingsCardGridItem>
      </Grid>
    </Box>
  );
}
