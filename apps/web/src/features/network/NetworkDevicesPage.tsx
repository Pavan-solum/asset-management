import { useMemo, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RouterIcon from '@mui/icons-material/Router';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../hooks/storeHooks';
import { NetworkStatusChip } from '../../components/NetworkStatusChip';
import { NETWORK_DEVICE_TYPE_LABELS } from '../../data/demoData';
import { formatDateTime } from '../../utils/format';
import type { NetworkDeviceType } from '../../types';

const typeIcons: Record<NetworkDeviceType, string> = {
  cctv: '📹',
  wifi_router: '📶',
  switch: '🔀',
  gateway: '🌐',
  firewall: '🛡️',
  access_point: '📡',
};

export function NetworkDevicesPage() {
  const navigate = useNavigate();
  const devices = useAppSelector((s) => s.networkDevices.items);

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.deviceTag.toLowerCase().includes(q) ||
        d.name.toLowerCase().includes(q) ||
        d.ipAddress.includes(q) ||
        d.location.toLowerCase().includes(q);
      const matchType = typeFilter === 'all' || d.type === typeFilter;
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [devices, search, typeFilter, statusFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const countsByType = useMemo(() => {
    const map: Record<string, number> = {};
    devices.forEach((d) => {
      map[d.type] = (map[d.type] ?? 0) + 1;
    });
    return map;
  }, [devices]);

  const onlineCount = devices.filter((d) => d.status === 'online').length;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Network Devices
          </Typography>
          <Typography variant="body2" color="text.secondary">
            CCTV, WiFi routers, switches, gateways & firewalls · {onlineCount}/{devices.length} online
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {(Object.keys(NETWORK_DEVICE_TYPE_LABELS) as NetworkDeviceType[]).map((type) => (
          <Chip
            key={type}
            label={`${typeIcons[type]} ${NETWORK_DEVICE_TYPE_LABELS[type]} (${countsByType[type] ?? 0})`}
            onClick={() => setTypeFilter(typeFilter === type ? 'all' : type)}
            color={typeFilter === type ? 'primary' : 'default'}
            variant={typeFilter === type ? 'filled' : 'outlined'}
          />
        ))}
      </Box>

      <Card sx={{ mb: 2, p: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by name, IP, location..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            sx={{ minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Type"
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">All Types</MenuItem>
            {(Object.keys(NETWORK_DEVICE_TYPE_LABELS) as NetworkDeviceType[]).map((type) => (
              <MenuItem key={type} value={type}>
                {NETWORK_DEVICE_TYPE_LABELS[type]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 140 }}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="online">Online</MenuItem>
            <MenuItem value="offline">Offline</MenuItem>
            <MenuItem value="warning">Warning</MenuItem>
            <MenuItem value="maintenance">Maintenance</MenuItem>
          </TextField>
        </Box>
      </Card>

      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Device Tag</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>IP Address</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Last Seen</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginated.map((device) => (
                <TableRow
                  key={device.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/network-devices/${device.id}`)}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RouterIcon fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight={600}>
                        {device.deviceTag}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={NETWORK_DEVICE_TYPE_LABELS[device.type]}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontFamily="monospace">
                      {device.ipAddress}
                    </Typography>
                  </TableCell>
                  <TableCell>{device.location}</TableCell>
                  <TableCell>
                    <NetworkStatusChip status={device.status} />
                  </TableCell>
                  <TableCell sx={{ minWidth: 100 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={device.uptimePercent}
                        sx={{ flex: 1, height: 6, borderRadius: 1 }}
                        color={
                          device.uptimePercent >= 99
                            ? 'success'
                            : device.uptimePercent >= 90
                              ? 'warning'
                              : 'error'
                        }
                      />
                      <Typography variant="caption">{device.uptimePercent}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(device.lastSeenAt)}
                  </TableCell>
                  <TableCell align="center" onClick={(e) => e.stopPropagation()}>
                    <Tooltip title="View details">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/network-devices/${device.id}`)}
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filtered.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Card>
    </Box>
  );
}
