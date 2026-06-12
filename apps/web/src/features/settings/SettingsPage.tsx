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
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';
import CloudIcon from '@mui/icons-material/Cloud';
import GroupIcon from '@mui/icons-material/Group';
import { useTenant, useAuthUser, usePermissions } from '../../hooks/storeHooks';

const demoUsers = [
  { name: 'Jane Admin', email: 'admin@acme.com', role: 'Tenant Admin' },
  { name: 'Mike Thompson', email: 'itadmin@acme.com', role: 'IT Admin' },
  { name: 'Lisa Viewer', email: 'viewer@acme.com', role: 'Viewer' },
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Tenant configuration and platform preferences
      </Typography>

      <Grid container spacing={2}>
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
