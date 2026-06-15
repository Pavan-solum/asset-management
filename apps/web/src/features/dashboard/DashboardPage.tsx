import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  alpha,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import { useAppSelector } from '../../hooks/storeHooks';
import { useAuthUser } from '../../hooks/storeHooks';
import { formatCurrency, daysUntil } from '../../utils/format';
import { STATUS_LABELS, CATEGORY_LABELS } from '../../data/demoData';
import { PageHeader } from '../../components/PageHeader';
import { EmptyState } from '../../components/EmptyState';

const CHART_COLORS = ['#1565C0', '#2E7D32', '#ED6C02', '#757575', '#D32F2F'];

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}) {
  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        ...(onClick && {
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 24px ${alpha(color, 0.15)}`,
          },
        }),
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: alpha(color, 0.1),
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <Box
      sx={{
        height: '85%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthUser();
  const assets = useAppSelector((s) => s.assets.items);
  const employees = useAppSelector((s) => s.employees.items);
  const auditLogs = useAppSelector((s) => s.audit.items);

  const byStatus = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.status] = (acc[a.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: STATUS_LABELS[name] ?? name, value }));

  const byCategory = Object.entries(
    assets.reduce<Record<string, number>>((acc, a) => {
      acc[a.category] = (acc[a.category] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name: CATEGORY_LABELS[name] ?? name, count: value }));

  const expiring30 = assets.filter((a) => daysUntil(a.warrantyExpiresAt) <= 30 && daysUntil(a.warrantyExpiresAt) >= 0);
  const expiring90 = assets.filter((a) => daysUntil(a.warrantyExpiresAt) <= 90 && daysUntil(a.warrantyExpiresAt) >= 0);
  const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
  const deployed = assets.filter((a) => a.status === 'deployed').length;
  const isEmpty = assets.length === 0;

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.firstName ?? 'there'}`}
        subtitle="IT asset overview and operational insights"
      />

      {isEmpty && (
        <Card
          sx={{
            mb: 3,
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          }}
        >
          <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', py: 2.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <TrendingUpIcon />
            </Box>
            <Box sx={{ flex: 1, minWidth: 200 }}>
              <Typography variant="subtitle1" fontWeight={700}>
                Get started with your inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Import assets from Excel or add them manually to populate your dashboard.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<UploadFileIcon />}
              onClick={() => navigate('/assets')}
            >
              Go to Assets
            </Button>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Assets"
            value={assets.length}
            subtitle={`${deployed} deployed`}
            icon={<InventoryIcon />}
            color="#1565C0"
            onClick={() => navigate('/assets')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Warranty Expiring"
            value={expiring30.length}
            subtitle="Within 30 days"
            icon={<WarningAmberIcon />}
            color="#ED6C02"
            onClick={() => navigate('/assets?warranty=30')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Employees"
            value={employees.length}
            subtitle={`${employees.filter((e) => e.status === 'active').length} active`}
            icon={<PeopleIcon />}
            color="#2E7D32"
            onClick={() => navigate('/employees')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Asset Value"
            value={formatCurrency(totalValue)}
            subtitle="Current book value"
            icon={<AttachMoneyIcon />}
            color="#00897B"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2.5} mb={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assets by Status
              </Typography>
              {byStatus.length === 0 ? (
                <ChartEmpty message="No assets to chart yet" />
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={byStatus}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                      label={({ name, percent }) =>
                        percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                      }
                    >
                      {byStatus.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: 380 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assets by Category
              </Typography>
              {byCategory.length === 0 ? (
                <ChartEmpty message="Import assets to see category breakdown" />
              ) : (
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={byCategory} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="count" fill="#1565C0" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Warranty Alerts</Typography>
                {expiring90.length > 0 && (
                  <Button size="small" onClick={() => navigate('/assets?warranty=90')}>
                    View all ({expiring90.length})
                  </Button>
                )}
              </Box>
              {expiring30.length === 0 ? (
                <EmptyState
                  icon={<WarningAmberIcon />}
                  title="No urgent warranty alerts"
                  description="Assets with warranties expiring within 30 days will appear here."
                />
              ) : (
                <List dense disablePadding>
                  {expiring30.slice(0, 5).map((asset) => (
                    <ListItem
                      key={asset.id}
                      sx={{
                        px: 0,
                        cursor: 'pointer',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                    >
                      <ListItemText
                        primary={`${asset.assetTag} — ${asset.name}`}
                        secondary={`Expires in ${daysUntil(asset.warrantyExpiresAt)} days`}
                        primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, 100 - daysUntil(asset.warrantyExpiresAt) * 3)}
                        sx={{ width: 72, ml: 2, borderRadius: 1, height: 6 }}
                        color="warning"
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button size="small" onClick={() => navigate('/audit')}>
                  View audit log
                </Button>
              </Box>
              {auditLogs.length === 0 ? (
                <EmptyState
                  icon={<TrendingUpIcon />}
                  title="No activity yet"
                  description="Changes to assets, assignments, and imports will show up here."
                />
              ) : (
                <List dense disablePadding>
                  {auditLogs.slice(0, 5).map((log) => (
                    <ListItem key={log.id} sx={{ px: 0, py: 0.75 }}>
                      <ListItemText
                        primary={`${log.action} — ${log.entityLabel}`}
                        secondary={`${log.userName} · ${new Date(log.createdAt).toLocaleString()}`}
                        primaryTypographyProps={{ fontWeight: 500, fontSize: '0.875rem' }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
