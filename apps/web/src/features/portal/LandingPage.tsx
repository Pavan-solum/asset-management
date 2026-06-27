import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  alpha,
  useTheme,
  AppBar,
  Toolbar,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory2';
import FolderIcon from '@mui/icons-material/Folder';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DevicesIcon from '@mui/icons-material/Devices';
import { useAppDispatch, useAuthUser } from '../../hooks/storeHooks';
import { getUserDisplayName, getUserInitials } from '../../utils/userDisplay';
import { logout } from '../../store/authSlice';
import { ThemeModeToggle } from '../../components/ThemeModeToggle';
import { APP_NAME } from '../../constants/brand';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
}

function ModuleCard({ title, description, icon, path }: ModuleCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      onClick={() => navigate(path)}
      elevation={0}
      sx={{
        height: '100%',
        cursor: 'pointer',
        bgcolor: '#f5f6f8',
        borderRadius: 3,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          bgcolor: '#eeeef2',
          boxShadow: '0 12px 24px rgba(0,0,0,0.05)',
        },
      }}
    >
      <CardContent sx={{ p: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box sx={{ color: '#1565C0', mb: 2 }}>
          {icon}
        </Box>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1a1a1a' }}>
          {title}
        </Typography>
        
        <Divider sx={{ my: 2, width: '80%', mx: 'auto', borderColor: alpha('#000', 0.1) }} />
        
        <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, lineHeight: 1.6 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}

export function LandingPage() {
  const user = useAuthUser();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);

  const handleLogout = () => {
    setAnchorEl(null);
    dispatch(logout());
    navigate('/login');
  };

  const modules = [
    ...(user?.role === 'employee'
      ? [
          {
            title: 'Employee Device Requests',
            description: 'Request new devices, replacements, accessories, and view request status.',
            icon: <DevicesIcon sx={{ fontSize: 48 }} />,
            path: '/portal',
          },
        ]
      : []),
    {
      title: 'Asset Management',
      description: 'Track hardware, software, procurement, and asset lifecycle.',
      icon: <InventoryIcon sx={{ fontSize: 48 }} />,
      path: '/dashboard',
    },
    {
      title: 'HR Policy & Management',
      description: 'Streamline payroll, attendance, leave policies, and employee management.',
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      path: '/hr',
    },
    {
      title: 'Employee Doc Management',
      description: 'Securely manage employee documents, onboarding checklists, and verification.',
      icon: <FolderIcon sx={{ fontSize: 48 }} />,
      path: '/onboarding',
    },
    {
      title: 'Finance & Expenses',
      description: 'Automate expense tracking, approvals, and payroll records.',
      icon: <AccountBalanceIcon sx={{ fontSize: 48 }} />,
      path: '/finance',
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ width: '100%', px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center' }}>
          <Box 
            component="img"
            src="/logo.png"
            alt="Assetly Logo"
            sx={{ 
              height: 38, 
              width: 38,
              objectFit: 'contain', 
              mr: 1.5,
              mixBlendMode: isDarkMode ? 'screen' : 'multiply',
              filter: isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none',
            }}
          />
          <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1 }}>
            {APP_NAME}
          </Typography>
          
          <ThemeModeToggle />

          {user ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main', fontSize: '0.8rem' }}>
                  {initials}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 200, mt: 1, borderRadius: 2 },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                {user.role === 'employee' ? (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/portal'); }}>
                    <ListItemIcon>
                      <DevicesIcon fontSize="small" />
                    </ListItemIcon>
                    Employee Portal
                  </MenuItem>
                ) : (
                  <MenuItem onClick={() => { setAnchorEl(null); navigate('/dashboard'); }}>
                    <ListItemIcon>
                      <DashboardIcon fontSize="small" />
                    </ListItemIcon>
                    Admin Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Sign out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="outlined"
              size="small"
              color="primary"
              startIcon={<LoginIcon />}
              onClick={() => navigate('/login')}
              sx={{ ml: 1.5, borderRadius: 2 }}
            >
              Sign In
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
        <Box sx={{ mb: 6, textAlign: 'center', pt: 4 }}>
          <Box 
            component="img" 
            src="/logo.png" 
            alt="Asset Manager Logo" 
            sx={{ 
              height: 100, mb: 3, objectFit: 'contain', 
              mixBlendMode: isDarkMode ? 'screen' : 'multiply',
              filter: isDarkMode ? 'invert(1) hue-rotate(180deg)' : 'none'
            }} 
          />
          <Typography variant="h3" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em', color: 'text.primary' }}>
            Unified Corporate Portal
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 400, maxWidth: 800, mx: 'auto' }}>
            {user ? `Welcome back, ${getUserDisplayName(user)}.` : 'Welcome.'} Select a module below to access your business operations.
          </Typography>
        </Box>

        <Grid container spacing={4} justifyContent="center">
          {modules.map((mod) => (
            <Grid item xs={12} sm={6} md={4} key={mod.title}>
              <ModuleCard {...mod} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
