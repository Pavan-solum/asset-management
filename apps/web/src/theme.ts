import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1565C0',
      light: '#5E92F3',
      dark: '#003C8F',
    },
    secondary: {
      main: '#00897B',
    },
    background: {
      default: '#F4F6F8',
      paper: '#FFFFFF',
    },
    success: { main: '#2E7D32' },
    warning: { main: '#ED6C02' },
    error: { main: '#D32F2F' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.06)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: '1px solid rgba(0,0,0,0.08)' },
      },
    },
  },
});
