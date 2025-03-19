import { Box, Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navbar from './Navbar';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    secondary: {
      main: '#303f9f',
    },
  },
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <Box component="main" sx={{ mt: 4, mb: 4, flex: 1, px: 2 }}>
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
} 