import { useState } from 'react';
import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar, DRAWER_WIDTH } from './Sidebar';
import { useAppDispatch, useAuthUser, useTenant } from '../../hooks/storeHooks';
import { logout } from '../../store/authSlice';

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAuthUser();
  const tenant = useTenant();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(true)}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {tenant?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              IT Asset & Remote Management
            </Typography>
          </Box>

          <Tooltip title="Alerts (Phase 2)">
            <IconButton color="inherit">
              <Badge badgeContent={4} color="error">
                <NotificationsOutlinedIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <AccountCircleIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              {user?.firstName} {user?.lastName} ({user?.role?.replace('_', ' ')})
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: '100%', md: 'auto' },
          bgcolor: 'background.default',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
