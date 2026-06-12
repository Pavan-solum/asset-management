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
import PeopleIcon from '@mui/icons-material/People';
import BusinessIcon from '@mui/icons-material/Business';
import StoreIcon from '@mui/icons-material/Store';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import DevicesIcon from '@mui/icons-material/Devices';
import DevicesOtherIcon from '@mui/icons-material/DevicesOther';
import LanIcon from '@mui/icons-material/Lan';
import { NavLink, useLocation } from 'react-router-dom';
import { useTenant, useAuthUser } from '../../hooks/storeHooks';

const DRAWER_WIDTH = 260;

const navItems = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/assets', label: 'Assets', icon: <InventoryIcon /> },
  { to: '/devices', label: 'Devices', icon: <DevicesOtherIcon /> },
  { to: '/network-devices', label: 'Network Devices', icon: <LanIcon /> },
  { to: '/employees', label: 'Employees', icon: <PeopleIcon /> },
  { to: '/departments', label: 'Departments', icon: <BusinessIcon /> },
  { to: '/vendors', label: 'Vendors', icon: <StoreIcon /> },
  { to: '/audit', label: 'Audit Logs', icon: <HistoryIcon /> },
  { to: '/settings', label: 'Settings', icon: <SettingsIcon /> },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const tenant = useTenant();
  const user = useAuthUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ px: 2, gap: 1.5 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
          <DevicesIcon />
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            IT Asset Platform
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {tenant?.name}
          </Typography>
        </Box>
      </Toolbar>

      <Box sx={{ px: 2, pb: 1 }}>
        <Chip label={tenant?.plan ?? 'Professional'} size="small" color="primary" variant="outlined" />
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1, py: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(`${item.to}/`)) ||
            (item.to !== '/' && location.pathname === item.to);
          return (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={isMobile ? onClose : undefined}
              selected={active}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
                  '&:hover': { bgcolor: 'primary.dark' },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: active ? 'inherit' : 'text.secondary' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: active ? 600 : 500 }} />
            </ListItemButton>
          );
        })}
      </List>

      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" fontWeight={600}>
          {user?.firstName} {user?.lastName}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {user?.email}
        </Typography>
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
            borderRight: '1px solid',
            borderColor: 'divider',
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
