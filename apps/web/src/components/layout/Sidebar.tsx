import {
  Box,
  Chip,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory2';
import StoreIcon from '@mui/icons-material/Store';
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DevicesIcon from '@mui/icons-material/Devices';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import LanIcon from '@mui/icons-material/Lan';
import SecurityIcon from '@mui/icons-material/Security';
import { NavLink, useLocation } from 'react-router-dom';
import { useTenant, useAuthUser, usePermissions } from '../../hooks/storeHooks';
import { getUserDisplayName, getUserInitials } from '../../utils/userDisplay';
import type { Permission } from '../../types';
import { APP_NAME } from '../../constants/brand';

const DRAWER_WIDTH = 268;

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  permission?: Permission;
};

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
      { to: '/requests', label: 'Requests', icon: <AssignmentIcon fontSize="small" />, permission: 'request:review' },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { to: '/assets', label: 'Assets', icon: <InventoryIcon fontSize="small" /> },
      { to: '/devices', label: 'Devices', icon: <DevicesOtherIcon fontSize="small" /> },
      { to: '/network-devices', label: 'Network Devices', icon: <LanIcon fontSize="small" /> },
    ],
  },
  {
    label: 'Organization',
    items: [
      { to: '/employees', label: 'Employees', icon: <PeopleIcon fontSize="small" /> },
      { to: '/departments', label: 'Departments', icon: <BusinessIcon fontSize="small" /> },
      { to: '/vendors', label: 'Vendors', icon: <StoreIcon fontSize="small" /> },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/endpoints', label: 'Endpoint Security', icon: <SecurityIcon fontSize="small" /> },
      { to: '/audit', label: 'Audit Logs', icon: <HistoryIcon fontSize="small" /> },
      { to: '/settings', label: 'Settings', icon: <SettingsIcon fontSize="small" /> },
    ],
  },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isNavActive(pathname: string, to: string): boolean {
  if (to === '/') return pathname === '/';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const tenant = useTenant();
  const user = useAuthUser();
  const { can } = usePermissions();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2.5, gap: 1.5, minHeight: { xs: 64, md: 72 } }}>
        <Avatar
          sx={{
            bgcolor: 'primary.main',
            width: 42,
            height: 42,
            boxShadow: '0 4px 12px rgba(21, 101, 192, 0.3)',
          }}
        >
          <DevicesIcon fontSize="small" />
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2} noWrap>
            {APP_NAME}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {tenant?.name}
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2.5, pb: 1.5 }}>
        <Chip
          label={tenant?.plan ?? 'Professional'}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Divider />

      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {navGroups.map((group) => (
          <Box key={group.label} sx={{ px: 1.5, mb: 1 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                px: 1.5,
                py: 0.75,
                display: 'block',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                fontSize: '0.6875rem',
              }}
            >
              {group.label}
            </Typography>
            <List disablePadding>
              {group.items
                .filter((item) => !item.permission || can(item.permission))
                .map((item) => {
                const active = isNavActive(location.pathname, item.to);
                return (
                  <ListItemButton
                    key={item.to}
                    component={NavLink}
                    to={item.to}
                    onClick={isMobile ? onClose : undefined}
                    selected={active}
                    sx={{
                      borderRadius: 2.5,
                      mb: 0.25,
                      py: 1,
                      '&.Mui-selected': {
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        boxShadow: '0 2px 8px rgba(21, 101, 192, 0.35)',
                        '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                        '&:hover': { bgcolor: 'primary.dark' },
                      },
                      '&:not(.Mui-selected):hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: active ? 'inherit' : 'text.secondary',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: active ? 600 : 500,
                        fontSize: '0.9375rem',
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      <Divider />

      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: 'secondary.main',
            fontSize: '0.875rem',
            fontWeight: 700,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {user?.email}
          </Typography>
        </Box>
      </Box>
    </Box>
  );

  return (
    <>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH } }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </>
  );
}

export { DRAWER_WIDTH };
