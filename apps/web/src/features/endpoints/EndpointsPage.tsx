import { useState, useEffect, Fragment } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, Collapse, IconButton, Grid, Divider, List,
  ListItem, ListItemText, Tabs, Tab
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { apiFetch } from '../../services/api/client';
import { ThreatPanel } from './components/ThreatPanel';
import { InstalledApps } from './components/InstalledApps';
import { DeviceContext } from './components/DeviceContext';
import { ActionsBar } from './components/ActionsBar';

function EndpointRow({ endpoint }: { endpoint: any }) {
  const [open, setOpen] = useState(false);
  const [portTab, setPortTab] = useState('All');

  const now = new Date();
  
  // Ensure we parse the postgres timestamp as UTC by appending Z if missing, and replacing space with T
  const lastSeenStr = endpoint.last_seen_at.replace(' ', 'T');
  const lastSeenUtcStr = lastSeenStr.endsWith('Z') ? lastSeenStr : `${lastSeenStr}Z`;
  const lastSeen = new Date(lastSeenUtcStr);
  
  const isOffline = (now.getTime() - lastSeen.getTime()) > 5 * 60 * 1000; // 5 mins
  const displayStatus = isOffline ? 'offline' : 'active';

  // Antivirus Signature calculation
  const avDateStr = endpoint.antivirus_updated_at;
  const avDate = avDateStr ? new Date(avDateStr) : null;
  const isValidDate = avDate && !isNaN(avDate.getTime());
  const isAvOutdated = isValidDate ? (now.getTime() - avDate.getTime()) >= 3 * 24 * 60 * 60 * 1000 : false;

  // Port filtering
  const allPorts = endpoint.active_ports || [];
  const filteredPorts = allPorts.filter((p: any) => {
    if (portTab === 'All') return true;
    if (portTab === 'Listening') return p.state?.toLowerCase() === 'listen';
    if (portTab === 'Established') return p.state?.toLowerCase() === 'established';
    return p.state?.toLowerCase() !== 'listen' && p.state?.toLowerCase() !== 'established';
  });

  return (
    <Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{endpoint.hostname}</TableCell>
        <TableCell>{endpoint.os_version}</TableCell>
        <TableCell>{endpoint.ip_address}</TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip label={displayStatus} color={displayStatus === 'active' ? 'success' : 'error'} size="small" />
            {(!endpoint.windows_updates || endpoint.windows_updates.length === 0) && (
              <Chip icon={<WarningAmberIcon />} label="Out of Date" color="warning" size="small" variant="outlined" />
            )}
          </Box>
        </TableCell>
        <TableCell>{new Date(endpoint.last_seen_at).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2 }}>
              
              {/* Actions Bar (Top-Right) */}
              <ActionsBar endpointId={endpoint.id} isOffline={isOffline} />

              {/* Threat Panel */}
              <ThreatPanel endpointId={endpoint.id} />

              <Typography variant="h6" gutterBottom component="div">
                Hardware & Telemetry
              </Typography>
              <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">MAC Address</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{endpoint.mac_address || 'Unknown'}</Typography>

                    <Typography variant="subtitle2" color="text.secondary">CPU Model</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{endpoint.cpu_model || 'Unknown'}</Typography>
                    
                    <Typography variant="subtitle2" color="text.secondary">Total Memory (RAM)</Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>{endpoint.ram_total_gb ? `${endpoint.ram_total_gb} GB` : 'Unknown'}</Typography>

                    <Typography variant="subtitle2" color="text.secondary">Total Storage</Typography>
                    <Typography variant="body1">{endpoint.storage_total_gb ? `${endpoint.storage_total_gb} GB` : 'Unknown'}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%', maxHeight: 200, overflowY: 'auto' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Installed Windows Updates</Typography>
                    {(!endpoint.windows_updates || endpoint.windows_updates.length === 0) && (
                      <Typography variant="body2" color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WarningAmberIcon fontSize="small" />
                        Device appears to be missing OS updates!
                      </Typography>
                    )}
                    {endpoint.windows_updates && endpoint.windows_updates.length > 0 && (
                      <List dense disablePadding>
                        {endpoint.windows_updates.map((update: string, idx: number) => (
                          <ListItem key={idx} disablePadding>
                            <ListItemText primary={update} />
                          </ListItem>
                        ))}
                      </List>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Device Context */}
              <DeviceContext endpointId={endpoint.id} />

              <Grid container spacing={3} mb={3}>
                {/* Security Profile */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Security Profile</Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Windows Firewall</Typography>
                      <Chip size="small" label={endpoint.firewall_status || 'Unknown'} color={endpoint.firewall_status === 'ON' ? 'success' : 'error'} />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Defender Real-Time Protection</Typography>
                      <Chip size="small" label={endpoint.defender_status || 'Unknown'} color={endpoint.defender_status === 'Active' ? 'success' : 'error'} />
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="body2">Antivirus Signature</Typography>
                      <Box textAlign="right">
                        <Chip 
                          size="small" 
                          label={isAvOutdated ? "Outdated" : (isValidDate ? "Up to date" : "Unknown")} 
                          color={isAvOutdated ? "error" : (isValidDate ? "success" : "default")} 
                          sx={{ mb: 0.5 }}
                        />
                        <Typography variant="body2" color="text.secondary" display="block">
                          {isValidDate ? avDate.toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '') : 'Unknown'}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                {/* Active Ports */}
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Active Network Connections</Typography>
                    
                    <Tabs value={portTab} onChange={(_, val) => setPortTab(val)} aria-label="network tabs" sx={{ minHeight: '36px', mb: 1 }}>
                      <Tab label={`All (${allPorts.length})`} value="All" sx={{ minHeight: '36px', py: 0.5 }} />
                      <Tab label={`Listening (${allPorts.filter((p:any) => p.state?.toLowerCase() === 'listen').length})`} value="Listening" sx={{ minHeight: '36px', py: 0.5 }} />
                      <Tab label={`Established (${allPorts.filter((p:any) => p.state?.toLowerCase() === 'established').length})`} value="Established" sx={{ minHeight: '36px', py: 0.5 }} />
                      <Tab label="Other" value="Other" sx={{ minHeight: '36px', py: 0.5 }} />
                    </Tabs>

                    <Box sx={{ maxHeight: 250, overflowY: 'auto' }}>
                      {filteredPorts.length > 0 ? (
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Proto</TableCell>
                              <TableCell>Local Port</TableCell>
                              <TableCell>Peer IP</TableCell>
                              <TableCell>State</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredPorts.map((port: any, idx: number) => (
                              <TableRow 
                                key={idx} 
                                sx={port.state?.toLowerCase() === 'established' ? { borderLeft: '4px solid #1976d2' } : {}}
                              >
                                <TableCell>{port.protocol}</TableCell>
                                <TableCell>{port.local_port}</TableCell>
                                <TableCell>{port.peer_address || '-'}</TableCell>
                                <TableCell>{port.state}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <Typography variant="body2" color="text.secondary">No connections matching this filter.</Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              {/* Installed Apps */}
              <InstalledApps endpointId={endpoint.id} />

            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </Fragment>
  );
}

export function EndpointsPage() {
  const [endpoints, setEndpoints] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEndpoints() {
      try {
        const data = await apiFetch<{ endpoints: any[] }>('/api/endpoints');
        setEndpoints(data.endpoints || []);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch endpoints', err);
        setError(err.message || 'Unknown error occurred');
      }
    }
    fetchEndpoints();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Endpoint Security</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Hostname</TableCell>
              <TableCell>OS Version</TableCell>
              <TableCell>IP Address</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Seen</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {error ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: 'error.main' }}>
                  Error: {error}
                </TableCell>
              </TableRow>
            ) : endpoints.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">No endpoints registered yet.</TableCell>
              </TableRow>
            ) : (
              endpoints.map((endpoint: any) => (
                <EndpointRow key={endpoint.id} endpoint={endpoint} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
