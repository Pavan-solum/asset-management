import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Chip, CircularProgress, Button, Grid } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import { apiFetch } from '../../../services/api/client';
import type { DeviceContextData } from '../../../types';

export function DeviceContext({ endpointId }: { endpointId: string }) {
  const [data, setData] = useState<DeviceContextData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContext = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<any>(`/api/endpoints/${endpointId}/device-context`);
      setData(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch device context');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, [endpointId]);

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={24} />
          <Typography>Loading device context...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderLeft: '4px solid #f44336' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" color="error" onClick={fetchContext} size="small">Retry</Button>
      </Paper>
    );
  }

  // Format Uptime
  const uptimeDays = data?.uptime_seconds ? Math.floor(data.uptime_seconds / 86400) : 0;
  const uptimeHours = data?.uptime_seconds ? Math.floor((data.uptime_seconds % 86400) / 3600) : 0;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Device Context</Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" color="text.secondary">Last Logged-in User</Typography>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <PersonIcon color="action" fontSize="small" />
            <Typography variant="body1">{data?.last_logged_user || 'Unknown'}</Typography>
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" color="text.secondary">Uptime</Typography>
          <Typography variant="body1" mb={1}>
            {data?.uptime_seconds ? `${uptimeDays} days, ${uptimeHours} hours` : 'Unknown'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" color="text.secondary">Last Reboot</Typography>
          <Typography variant="body1" mb={1}>
            {data?.last_reboot_at ? new Date(data.last_reboot_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '') : 'Unknown'}
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" color="text.secondary">Agent Version</Typography>
          <Chip label={data?.agent_version || 'Unknown'} size="small" variant="outlined" sx={{ mt: 0.5 }} />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" color="text.secondary">BitLocker Status</Typography>
          <Box display="flex" alignItems="center" gap={1} mt={0.5}>
            <Chip 
              label={data?.bitlocker_status?.toUpperCase() || 'UNKNOWN'} 
              color={data?.bitlocker_status === 'enabled' ? 'success' : (data?.bitlocker_status === 'disabled' ? 'error' : 'default')} 
              size="small" 
            />
            {data?.bitlocker_drive && (
              <Typography variant="body2" color="text.secondary">Drive {data.bitlocker_drive}</Typography>
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
