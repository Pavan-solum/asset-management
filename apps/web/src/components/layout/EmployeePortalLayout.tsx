import { useState } from 'react';
import {
  AppBar,
  Avatar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import DevicesIcon from '@mui/icons-material/Devices';
import { Outlet, useNavigate } from 'react-router-dom';
import { ThemeModeToggle } from '../ThemeModeToggle';
import { useAppDispatch, useAuthUser, useTenant } from '../../hooks/storeHooks';
import { logout } from '../../store/authSlice';
import { APP_NAME } from '../../constants/brand';
import { getUserDisplayName, getUserInitials } from '../../utils/userDisplay';

export function EmployeePortalLayout() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAuthUser();
  const tenant = useTenant();

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ maxWidth: 960, width: '100%', mx: 'auto' }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, mr: 1.5 }}>
            <DevicesIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {APP_NAME}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              Device Request Portal · {tenant?.name}
            </Typography>
          </Box>
          <ThemeModeToggle />
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>
              {initials}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <Box sx={{ px: 2, py: 1, minWidth: 200 }}>
              <Typography variant="body2" fontWeight={600}>
                {displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Sign out
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="main" sx={{ maxWidth: 960, width: '100%', mx: 'auto', px: { xs: 2, sm: 3 }, py: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
