import { Box, Card, CardContent, Grid, Typography, Divider, alpha, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory2';
import FolderIcon from '@mui/icons-material/Folder';
import { useAuthUser } from '../../hooks/storeHooks';
import { getUserDisplayName } from '../../utils/userDisplay';

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
  const theme = useTheme();
  const isDarkMode = theme.palette.mode === 'dark';

  const modules = [
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 6, textAlign: 'center', pt: 8 }}>
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
  );
}
