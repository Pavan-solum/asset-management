import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Divider,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import RuleFolderOutlinedIcon from '@mui/icons-material/RuleFolderOutlined';
import SearchIcon from '@mui/icons-material/Search';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { NavLink, useLocation } from 'react-router-dom';

const DRAWER_WIDTH = 280;

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { to: '/exec-docs', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
  { to: '/exec-docs/library', label: 'Library', icon: <DescriptionOutlinedIcon /> },
  { to: '/exec-docs/finance', label: 'Finance', icon: <AccountBalanceWalletOutlinedIcon /> },
  { to: '/exec-docs/meetings', label: 'Meetings', icon: <CalendarMonthOutlinedIcon /> },
  { to: '/exec-docs/compliance', label: 'Compliance', icon: <RuleFolderOutlinedIcon /> },
];

interface ExecDocsSidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

function isNavActive(pathname: string, to: string): boolean {
  if (to === '/exec-docs') return pathname === '/exec-docs';
  return pathname === to || pathname.startsWith(`${to}/`);
}

export function ExecDocsSidebar({ mobileOpen, onClose }: ExecDocsSidebarProps) {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', px: 3, py: 4 }}>
      {/* Brand Header */}
      <Box sx={{ mb: 4, px: 1 }}>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            color: '#0D47A1',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}
        >
          ExecDocs
        </Typography>
        <Typography
          variant="caption"
          sx={{
            color: '#757575',
            fontWeight: 700,
            letterSpacing: '0.08em',
            display: 'block',
            mt: 0.5,
            textTransform: 'uppercase',
            fontSize: '0.6875rem',
          }}
        >
          Enterprise Leadership
        </Typography>
      </Box>

      {/* Pill Search Input */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search Documents"
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: '#90A4AE' }} />
              </InputAdornment>
            ),
            sx: {
              borderRadius: '24px',
              bgcolor: '#0c1b22',
              color: '#FFFFFF',
              height: '44px',
              fontSize: '0.875rem',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
              '& input::placeholder': {
                color: '#90A4AE',
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Menu List */}
      <Box sx={{ flex: 1 }}>
        <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {navItems.map((item) => {
            const active = isNavActive(location.pathname, item.to);
            return (
              <ListItemButton
                key={item.to}
                component={NavLink}
                to={item.to}
                onClick={isMobile ? onClose : undefined}
                selected={active}
                sx={{
                  borderRadius: '12px',
                  py: 1.25,
                  px: 2,
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    bgcolor: '#E3F2FD',
                    color: '#0D47A1',
                    '& .MuiListItemIcon-root': {
                      color: '#0D47A1',
                    },
                    '& .MuiTypography-root': {
                      fontWeight: 700,
                    },
                    '&:hover': {
                      bgcolor: '#E3F2FD',
                    },
                  },
                  '&:not(.Mui-selected)': {
                    color: '#424242',
                    '& .MuiListItemIcon-root': {
                      color: '#616161',
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Footer Nav back to portal */}
      <Box>
        <Divider sx={{ my: 2 }} />
        <ListItemButton
          component={NavLink}
          to="/"
          onClick={isMobile ? onClose : undefined}
          sx={{
            borderRadius: '12px',
            py: 1.25,
            px: 2,
            color: '#757575',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary',
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 38, color: 'inherit' }}>
            <HomeOutlinedIcon />
          </ListItemIcon>
          <ListItemText
            primary="Back to Portal"
            primaryTypographyProps={{
              fontSize: '0.9375rem',
              fontWeight: 500,
            }}
          />
        </ListItemButton>
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
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
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
