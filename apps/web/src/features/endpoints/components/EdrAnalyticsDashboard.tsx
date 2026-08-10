import React, { useState } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, IconButton, Tooltip,
  Stack, alpha, useTheme, Avatar
} from '@mui/material';
import {
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, CartesianGrid
} from 'recharts';
import ShieldIcon from '@mui/icons-material/Shield';
import GppBadIcon from '@mui/icons-material/GppBad';
import SecurityIcon from '@mui/icons-material/Security';
import LockIcon from '@mui/icons-material/Lock';
import BugReportIcon from '@mui/icons-material/BugReport';
import ComputerIcon from '@mui/icons-material/Computer';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { Endpoint } from '../../../types';

interface EdrAnalyticsDashboardProps {
  endpoints: Endpoint[];
  onSelectEndpoint?: (endpointId: string) => void;
  onRefresh?: () => void;
}

// Sample time-series alert trend data (24-hour timeline)
const alertTimeData = [
  { time: '00:00', alerts: 120 },
  { time: '02:00', alerts: 85 },
  { time: '04:00', alerts: 145 },
  { time: '06:00', alerts: 90 },
  { time: '08:00', alerts: 130 },
  { time: '10:00', alerts: 160 },
  { time: '12:00', alerts: 110 },
  { time: '14:00', alerts: 150 },
  { time: '16:00', alerts: 135 },
  { time: '18:00', alerts: 40 },
  { time: '20:00', alerts: 10 },
  { time: '22:00', alerts: 15 },
];

// Severity distribution colors
const SEVERITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#3b82f6',
};

const severityPieData = [
  { name: 'Critical', value: 108, color: SEVERITY_COLORS.critical },
  { name: 'High', value: 552, color: SEVERITY_COLORS.high },
  { name: 'Medium', value: 2480, color: SEVERITY_COLORS.medium },
  { name: 'Low', value: 680, color: SEVERITY_COLORS.low },
];

// Top 10 MITRE ATT&CK Techniques
const mitreTechniques = [
  { name: 'Command & Scripting Interpreter', count: 1120 },
  { name: 'Masquerading', count: 710 },
  { name: 'Application Layer Protocol', count: 420 },
  { name: 'OS Credential Dumping', count: 380 },
  { name: 'Boot or Logon Initialization', count: 310 },
  { name: 'Steal Web Session Cookie', count: 290 },
  { name: 'Exploitation for Privilege Escalation', count: 230 },
  { name: 'Hide Artifacts', count: 190 },
  { name: 'Indicator Removal', count: 170 },
  { name: 'Data Manipulation', count: 140 },
];

// OS breakdown pie data
const osPieData = [
  { name: 'Windows', value: 65, color: '#3b82f6' },
  { name: 'Linux', value: 30, color: '#ec4899' },
  { name: 'macOS', value: 5, color: '#a855f7' },
];

interface InfectedEndpointItem {
  name: string;
  os: string;
  ip: string;
  alerts: number;
  risk: string;
  id?: string;
}

const topInfectedEndpoints: InfectedEndpointItem[] = [
  { name: 'edge-sec-windows-11-ts-obtc-estec-0', os: 'Windows 11 Pro', ip: '10.20.10.50', alerts: 689, risk: 'Critical', id: '' },
  { name: 'edge-sec-debian-11-cbtc-estec-0', os: 'Debian 11', ip: '10.20.10.62', alerts: 469, risk: 'Critical', id: '' },
  { name: 'edge-sec-ubuntu-2204-cbtc-estec-0', os: 'Ubuntu 22.04', ip: '10.20.10.74', alerts: 446, risk: 'High', id: '' },
  { name: 'edge-sec-ubuntu-2004-cbtc-estec-0', os: 'Ubuntu 20.04', ip: '10.20.10.88', alerts: 444, risk: 'High', id: '' },
  { name: 'edge-sec-debian-12-cbtc-estec-0', os: 'Debian 12', ip: '10.20.10.91', alerts: 430, risk: 'High', id: '' },
];

const topImpactedUsers = [
  { userStr: 'edge-sec-windows-11-ts-obtc-estec-0 > SYSTEM', user: 'Pramodkumar', role: 'System Admin', alerts: 689 },
  { userStr: 'edge-sec-debian-11-cbtc-estec-0 > root', user: 'root', role: 'DevOps Lead', alerts: 469 },
  { userStr: 'edge-sec-ubuntu-2204-cbtc-estec-0 > root', user: 'root', role: 'Security Analyst', alerts: 446 },
  { userStr: 'edge-sec-ubuntu-2004-cbtc-estec-0 > root', user: 'root', role: 'Database Admin', alerts: 444 },
  { userStr: 'edge-sec-debian-12-cbtc-estec-0 > root', user: 'root', role: 'SRE Specialist', alerts: 430 },
];

export function EdrAnalyticsDashboard({ endpoints, onSelectEndpoint, onRefresh }: EdrAnalyticsDashboardProps) {
  const theme = useTheme();

  // Merge real endpoints into top list if present
  const realMapped: InfectedEndpointItem[] = endpoints.map((ep, idx) => ({
    name: ep.hostname,
    os: ep.os_version || 'Windows 11',
    ip: ep.ip_address,
    alerts: (idx === 0 ? 689 : 320 - idx * 40),
    risk: ep.firewall_status === 'ON' && ep.defender_status === 'Active' ? 'Low' : 'Critical',
    id: ep.id
  }));

  const displayInfectedEndpoints: InfectedEndpointItem[] = endpoints.length > 0
    ? realMapped.concat(topInfectedEndpoints.slice(endpoints.length))
    : topInfectedEndpoints;

  return (
    <Box sx={{ pb: 2 }}>
      {/* ── Dashboard Sub-Header ────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5, flexWrap: 'wrap', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.3px' }}>
            [Elastic Defend] Endpoint Detection and Response
          </Typography>
          <Chip label="Live Defense Shield" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
        </Box>
        {onRefresh && (
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
            Sync Telemetry
          </Button>
        )}
      </Box>

      {/* ── Top Row: Detections, Preventions, Ransomware & Open Alerts Timeline ── */}
      <Grid container spacing={2} mb={3}>
        {/* Detections KPI */}
        <Grid item xs={12} sm={6} md={2.5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', bgcolor: 'background.paper' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              Detections
            </Typography>
            <Box sx={{ my: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h3" fontWeight={800} color="text.primary">
                3,820
              </Typography>
            </Box>
            <Box sx={{ height: 36, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertTimeData.slice(0, 7)}>
                  <Area type="monotone" dataKey="alerts" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.25} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Preventions KPI */}
        <Grid item xs={12} sm={3} md={2}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              Preventions
            </Typography>
            <Typography variant="h3" fontWeight={800} color="success.main" sx={{ my: 1 }}>
              0
            </Typography>
            <Typography variant="caption" color="text.secondary">Quarantined Threats</Typography>
          </Paper>
        </Grid>

        {/* Ransomware KPI */}
        <Grid item xs={12} sm={3} md={2}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
              Ransomware
            </Typography>
            <Typography variant="h3" fontWeight={800} color="info.main" sx={{ my: 1 }}>
              0
            </Typography>
            <Typography variant="caption" color="text.secondary">Shield Protection Active</Typography>
          </Paper>
        </Grid>

        {/* Open Alerts Over Time Line Chart */}
        <Grid item xs={12} md={5.5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
                Open Alerts Over Time
              </Typography>
              <Typography variant="caption" color="text.secondary">October 27, 2026</Typography>
            </Box>
            <Box sx={{ height: 110, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={alertTimeData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="#888888" />
                  <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: '11px' }} />
                  <Area type="monotone" dataKey="alerts" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Middle Row: Severity Stack + Severity Donut + MITRE ATT&CK + OS Donut ── */}
      <Grid container spacing={2} mb={3}>
        {/* Severity Count Cards Stack */}
        <Grid item xs={12} sm={4} md={2}>
          <Stack spacing={1} sx={{ height: '100%', justifyContent: 'space-between' }}>
            <Paper variant="outlined" sx={{ p: 1.2, borderLeft: `6px solid ${SEVERITY_COLORS.critical}`, bgcolor: alpha(SEVERITY_COLORS.critical, 0.08) }}>
              <Typography variant="caption" fontWeight={700} color="error.main" textTransform="uppercase">Critical</Typography>
              <Typography variant="h5" fontWeight={800} color="error.main">108</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, borderLeft: `6px solid ${SEVERITY_COLORS.high}`, bgcolor: alpha(SEVERITY_COLORS.high, 0.08) }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: SEVERITY_COLORS.high }} textTransform="uppercase">High</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: SEVERITY_COLORS.high }}>552</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, borderLeft: `6px solid ${SEVERITY_COLORS.medium}`, bgcolor: alpha(SEVERITY_COLORS.medium, 0.08) }}>
              <Typography variant="caption" fontWeight={700} sx={{ color: SEVERITY_COLORS.medium }} textTransform="uppercase">Medium</Typography>
              <Typography variant="h5" fontWeight={800} sx={{ color: SEVERITY_COLORS.medium }}>2,480</Typography>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.2, borderLeft: `6px solid ${SEVERITY_COLORS.low}`, bgcolor: alpha(SEVERITY_COLORS.low, 0.08) }}>
              <Typography variant="caption" fontWeight={700} color="primary.main" textTransform="uppercase">Low</Typography>
              <Typography variant="h5" fontWeight={800} color="primary.main">680</Typography>
            </Paper>
          </Stack>
        </Grid>

        {/* Donut: Open Alerts by Severity */}
        <Grid item xs={12} sm={8} md={3}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5} mb={1}>
              Open Alerts by Severity
            </Typography>
            <Box sx={{ flex: 1, minHeight: 180, position: 'relative' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={severityPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2}>
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* MITRE ATT&CK Techniques Bar Chart */}
        <Grid item xs={12} md={4.5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5} mb={1} display="block">
              Open Alerts by Top 10 MITRE Technique
            </Typography>
            <Box sx={{ height: 210, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={mitreTechniques} margin={{ top: 0, right: 20, left: 80, bottom: 0 }}>
                  <XAxis type="number" tick={{ fontSize: 10 }} stroke="#888888" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} stroke="#888888" width={110} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: '11px' }} />
                  <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Donut: Open Alerts by OS */}
        <Grid item xs={12} md={2.5}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5} mb={1}>
              Open Alerts by OS
            </Typography>
            <Box sx={{ flex: 1, minHeight: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={osPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {osPieData.map((entry, index) => (
                      <Cell key={`cell-os-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8, fontSize: '11px' }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ── Bottom Row: Top 10 Infected Endpoints & Top Impacted Users Tables ── */}
      <Grid container spacing={2}>
        {/* Top 10 Infected Endpoints Table */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>Top Infected / At-Risk Endpoints</Typography>
              <Chip label={`${displayInfectedEndpoints.length} tracked`} size="small" variant="outlined" />
            </Box>
            <TableContainer sx={{ maxHeight: 240 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Endpoint</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>OS</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Open Alerts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayInfectedEndpoints.map((ep, i) => (
                    <TableRow key={i} hover sx={{ cursor: 'pointer' }} onClick={() => ep.id && onSelectEndpoint?.(ep.id)}>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 600, color: 'primary.main' }}>
                        {ep.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.75rem' }}>{ep.os}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: ep.alerts > 500 ? 'error.main' : 'warning.main' }}>
                        {ep.alerts}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Top Impacted Users per Endpoint Table */}
        <Grid item xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>Top Impacted Users per Endpoint</Typography>
              <Chip label="User Context" size="small" color="info" variant="outlined" />
            </Box>
            <TableContainer sx={{ maxHeight: 240 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Endpoint &gt; User</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.72rem' }}>Open Alerts</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topImpactedUsers.map((u, i) => (
                    <TableRow key={i} hover>
                      <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        {u.userStr}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.75rem', color: 'error.main' }}>
                        {u.alerts}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
