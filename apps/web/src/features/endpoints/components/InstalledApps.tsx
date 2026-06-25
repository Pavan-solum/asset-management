import { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, Switch, FormControlLabel,
  CircularProgress, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Collapse
} from '@mui/material';
import { apiFetch } from '../../../services/api/client';

export function InstalledApps({ endpointId }: { endpointId: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vulnerableOnly, setVulnerableOnly] = useState(false);
  const [expandedCve, setExpandedCve] = useState<number | null>(null);

  const fetchApps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ apps: any[] }>(`/api/endpoints/${endpointId}/installed-apps?vulnerable=${vulnerableOnly}`);
      setApps(data.apps || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch installed apps');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [endpointId, vulnerableOnly]);

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={24} />
          <Typography>Loading apps...</Typography>
        </Box>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mb: 3, borderLeft: '4px solid #f44336' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" color="error" onClick={fetchApps} size="small">Retry</Button>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">Installed Apps & CVE Exposure</Typography>
        <FormControlLabel
          control={<Switch size="small" checked={vulnerableOnly} onChange={(e) => setVulnerableOnly(e.target.checked)} />}
          label="Vulnerable only"
        />
      </Box>

      {apps.length === 0 ? (
        <Typography color="text.secondary">No apps found matching criteria.</Typography>
      ) : (
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>App Name</TableCell>
                <TableCell>Version</TableCell>
                <TableCell>Publisher</TableCell>
                <TableCell>Install Date</TableCell>
                <TableCell>CVE Exposure</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {apps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.app_name}</TableCell>
                  <TableCell>{app.version || '-'}</TableCell>
                  <TableCell>{app.publisher || '-'}</TableCell>
                  <TableCell>{app.install_date ? new Date(app.install_date).toLocaleDateString() : '-'}</TableCell>
                  <TableCell>
                    {app.cve_count > 0 ? (
                      <Box>
                        <Chip
                          label={`${app.cve_count} Vulnerabilities`}
                          color="error"
                          size="small"
                          onClick={() => setExpandedCve(expandedCve === app.id ? null : app.id)}
                          sx={{ cursor: 'pointer' }}
                        />
                        <Collapse in={expandedCve === app.id} timeout="auto" unmountOnExit>
                          <Box mt={1} p={1} bgcolor="error.light" borderRadius={1}>
                            <Typography variant="caption" color="error.contrastText">
                              {(app.cve_ids || []).join(', ')}
                            </Typography>
                          </Box>
                        </Collapse>
                      </Box>
                    ) : (
                      <Chip label="Clean" color="success" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}
