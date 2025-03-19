import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Button,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget);
  };

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchor(event.currentTarget);
  };

  const handleClose = () => {
    setMenuAnchor(null);
    setProfileAnchor(null);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    handleClose();
  };

  return (
    <AppBar position="fixed" sx={{ 
      backgroundColor: 'grey', // A dark neutral background that complements the blue logo
      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
    }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleMenuOpen}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton> */}

          <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
               onClick={() => handleNavigation('/')}>
            <a href="https://www.onezippy.com/" target="_blank" rel="noopener noreferrer">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={40}
                priority
                style={{ borderRadius: '8px' }}
              />
            </a>
            <Typography variant="h6" sx={{ 
              ml: 2,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #fff, #e3f2fd)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              PIXEL
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button color="inherit" onClick={() => handleNavigation('/dashboard')}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => handleNavigation('/documents')}>
            Documents
          </Button>
          
          <IconButton 
            onClick={handleProfileOpen}
            sx={{ 
              ml: 2,
              border: '2px solid rgba(255,255,255,0.2)',
              '&:hover': { 
                border: '2px solid rgba(255,255,255,0.4)',
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <Avatar sx={{ 
              bgcolor: '#303f9f',
              width: 32,
              height: 32
            }}>
              JS
            </Avatar>
          </IconButton>
        </Box>

        {/* Main Menu */}
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 220, mt: 1.5 }
          }}
        >
          <MenuItem onClick={() => handleNavigation('/dashboard')}>
            <ListItemIcon><DashboardIcon fontSize="small" /></ListItemIcon>
            Dashboard
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/documents')}>
            <ListItemIcon><DocumentIcon fontSize="small" /></ListItemIcon>
            Documents
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
        </Menu>

        {/* Profile Menu */}
        <Menu
          anchorEl={profileAnchor}
          open={Boolean(profileAnchor)}
          onClose={handleClose}
          PaperProps={{
            sx: { width: 220, mt: 1.5 }
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>John Smith</Typography>
            <Typography variant="body2" color="text.secondary">john@example.com</Typography>
          </Box>
          <Divider />
          <MenuItem onClick={() => handleNavigation('/profile')}>
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem onClick={() => handleNavigation('/settings')}>
            <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
            Settings
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleNavigation('/login')} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" color="error" />
            </ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
} 