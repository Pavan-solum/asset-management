import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  LinearProgress,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
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
import { formatCurrency, daysUntil } from '../../utils/format';
import { STATUS_LABELS, CATEGORY_LABELS } from '../../data/demoData';

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
    <Card sx={{ height: '100%', cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              bgcolor: `${color}15`,
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

export function DashboardPage() {
  const navigate = useNavigate();
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

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={3}>
        IT asset overview for Acme Corp
      </Typography>

      <Grid container spacing={2} mb={3}>
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

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={5}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assets by Status
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={byStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                    {byStatus.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: 360 }}>
            <CardContent sx={{ height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Assets by Category
              </Typography>
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={byCategory}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1565C0" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Warranty Alerts</Typography>
                <Button size="small" onClick={() => navigate('/assets?warranty=90')}>
                  View all ({expiring90.length})
                </Button>
              </Box>
              {expiring30.length === 0 ? (
                <Typography color="text.secondary">No warranties expiring in 30 days</Typography>
              ) : (
                <List dense disablePadding>
                  {expiring30.slice(0, 5).map((asset) => (
                    <ListItem
                      key={asset.id}
                      sx={{ px: 0, cursor: 'pointer' }}
                      onClick={() => navigate(`/assets/${asset.id}`)}
                    >
                      <ListItemText
                        primary={`${asset.assetTag} — ${asset.name}`}
                        secondary={`Expires in ${daysUntil(asset.warrantyExpiresAt)} days`}
                      />
                      <LinearProgress
                        variant="determinate"
                        value={Math.max(0, 100 - daysUntil(asset.warrantyExpiresAt) * 3)}
                        sx={{ width: 80, ml: 2 }}
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
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Recent Activity</Typography>
                <Button size="small" onClick={() => navigate('/audit')}>
                  View audit log
                </Button>
              </Box>
              <List dense disablePadding>
                {auditLogs.slice(0, 5).map((log) => (
                  <ListItem key={log.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${log.action} — ${log.entityLabel}`}
                      secondary={`${log.userName} · ${new Date(log.createdAt).toLocaleString()}`}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
