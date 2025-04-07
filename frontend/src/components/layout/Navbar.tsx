'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { 
  AppBar, 
  Toolbar, 
  Button, 
  IconButton, 
  Drawer, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon,
  Box, 
  Container, 
  useMediaQuery, 
  useTheme, 
  Avatar,
  Fade
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalculateIcon from '@mui/icons-material/Calculate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InfoIcon from '@mui/icons-material/Info';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useAppSelector } from '@/hooks/reduxHooks';

interface NavLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  isHome?: boolean;
}

const navLinks: NavLink[] = [
  { name: 'Inicio', href: '/', icon: <HomeIcon />, isHome: true },
  { name: 'Catálogo', href: '/catalogo', icon: <DirectionsCarIcon /> },
  { name: 'Financiamiento', href: '/financiamiento', icon: <AttachMoneyIcon /> },
  { name: 'Calculadora', href: '/calculadora', icon: <CalculateIcon /> },
  { name: 'Nosotros', href: '/nosotros', icon: <InfoIcon /> },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  const handleNavigation = (href: string, isHome = false) => {
    setDrawerOpen(false);
    
    // Utilizar navegación forzada para la página de inicio
    if (isHome) {
      // Forzar recarga completa para la página de inicio
      window.location.href = href;
    } else {
      // Usar router.push para otras páginas
      router.push(href);
    }
  };

  const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
    if (
      event.type === 'keydown' &&
      ((event as React.KeyboardEvent).key === 'Tab' || (event as React.KeyboardEvent).key === 'Shift')
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawerContent = (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onKeyDown={toggleDrawer(false)}
    >
      <Box 
        sx={{ 
          p: 2, 
          display: 'flex', 
          justifyContent: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 1,
          cursor: 'pointer'
        }}
        onClick={() => handleNavigation('/', true)}
      >
        <Image 
          src="/logo.svg" 
          alt="LlévateloExpress" 
          width={180} 
          height={45} 
          priority
        />
      </Box>
      <List>
        {navLinks.map((link) => (
          <ListItem 
            key={link.name} 
            onClick={() => handleNavigation(link.href, link.isHome)}
            sx={{ 
              color: pathname === link.href ? 'primary.main' : 'text.primary',
              bgcolor: pathname === link.href ? 'primary.50' : 'transparent',
              '&:hover': {
                bgcolor: pathname === link.href ? 'primary.100' : 'action.hover',
              },
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              cursor: 'pointer'
            }}
          >
            <ListItemIcon sx={{ 
              color: pathname === link.href ? 'primary.main' : 'text.secondary',
              minWidth: '40px'
            }}>
              {link.icon}
            </ListItemIcon>
            <ListItemText 
              primary={link.name} 
              primaryTypographyProps={{
                fontWeight: pathname === link.href ? 600 : 400
              }}
            />
          </ListItem>
        ))}

        <Box sx={{ mt: 2, mb: 1, mx: 2 }}>
          <Box sx={{ height: '1px', bgcolor: 'divider' }} />
        </Box>

        {!isAuthenticated ? (
          <>
            <ListItem 
              onClick={() => handleNavigation('/login')}
              sx={{ 
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <LoginIcon />
              </ListItemIcon>
              <ListItemText primary="Iniciar Sesión" />
            </ListItem>
            <ListItem 
              onClick={() => handleNavigation('/registro')}
              sx={{ 
                borderRadius: 1,
                mx: 1,
                mb: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ minWidth: '40px' }}>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary="Registrarse" />
            </ListItem>
          </>
        ) : (
          <ListItem 
            onClick={() => handleNavigation('/perfil')}
            sx={{ 
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': { bgcolor: 'action.hover' },
              cursor: 'pointer'
            }}
          >
            <ListItemIcon sx={{ minWidth: '40px' }}>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Mi Perfil" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <Fade in={true} timeout={800}>
      <AppBar 
        position="sticky" 
        elevation={scrolled ? 2 : 0}
        sx={{ 
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(8px)' : 'none',
          color: scrolled ? 'text.primary' : 'white',
          transition: 'all 0.3s ease-in-out',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
          py: scrolled ? 0 : 0.5,
          zIndex: 1100,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <a 
              href="/"
              style={{ 
                textDecoration: 'none', 
                color: 'inherit', 
                display: 'flex',
                cursor: 'pointer' 
              }}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation('/', true);
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', py: 1 }}>
                <Image 
                  src="/logo.svg" 
                  alt="LlévateloExpress" 
                  width={160} 
                  height={40} 
                  priority
                  style={{
                    filter: scrolled ? 'none' : 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))'
                  }}
                />
              </Box>
            </a>

            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {navLinks.map((link) => (
                  <Button
                    key={link.name}
                    component={link.isHome ? 'a' : 'button'}
                    href={link.isHome ? '/' : undefined}
                    onClick={(e) => {
                      if (link.isHome) e.preventDefault();
                      handleNavigation(link.href, link.isHome);
                    }}
                    startIcon={link.icon}
                    sx={{
                      color: scrolled 
                        ? (pathname === link.href ? 'primary.main' : 'text.primary') 
                        : 'white',
                      fontWeight: pathname === link.href ? 600 : 400,
                      mx: 0.5,
                      py: 1,
                      px: 2,
                      borderRadius: 2,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:after': pathname === link.href ? {
                        content: '""',
                        position: 'absolute',
                        bottom: 0,
                        left: '20%',
                        width: '60%',
                        height: '3px',
                        backgroundColor: scrolled ? 'primary.main' : 'white',
                        borderRadius: '3px 3px 0 0',
                      } : {},
                      '&:hover': {
                        backgroundColor: scrolled 
                          ? 'rgba(0, 0, 0, 0.04)' 
                          : 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    {link.name}
                  </Button>
                ))}
                
                {/* Auth Buttons */}
                {!isAuthenticated ? (
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Button 
                      onClick={() => handleNavigation('/login')}
                      color={scrolled ? 'primary' : 'inherit'}
                      variant={scrolled ? 'outlined' : 'outlined'}
                      startIcon={<LoginIcon />}
                      sx={{ 
                        borderColor: scrolled ? 'primary.main' : 'white',
                        color: scrolled ? 'primary.main' : 'white',
                        '&:hover': {
                          borderColor: scrolled ? 'primary.dark' : 'white',
                          backgroundColor: scrolled ? 'rgba(2, 132, 199, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      Iniciar Sesión
                    </Button>
                    <Button 
                      onClick={() => handleNavigation('/registro')}
                      color={scrolled ? 'primary' : 'inherit'}
                      variant="contained"
                      startIcon={<PersonAddIcon />}
                      sx={{ 
                        bgcolor: scrolled ? 'primary.main' : 'white',
                        color: scrolled ? 'white' : 'primary.main',
                        '&:hover': {
                          bgcolor: scrolled ? 'primary.dark' : 'rgba(255, 255, 255, 0.9)',
                        }
                      }}
                    >
                      Registrarse
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                    <Button 
                      onClick={() => handleNavigation('/perfil')}
                      color={scrolled ? 'primary' : 'inherit'}
                      variant={scrolled ? 'outlined' : 'outlined'}
                      startIcon={<AccountCircleIcon />}
                      endIcon={user?.first_name ? (
                        <Avatar 
                          sx={{ 
                            width: 28, 
                            height: 28,
                            ml: 1,
                            bgcolor: scrolled ? 'primary.main' : 'white',
                            color: scrolled ? 'white' : 'primary.main',
                          }}
                        >
                          {user.first_name.charAt(0)}
                        </Avatar>
                      ) : null}
                      sx={{ 
                        borderColor: scrolled ? 'primary.main' : 'white',
                        color: scrolled ? 'primary.main' : 'white',
                        '&:hover': {
                          borderColor: scrolled ? 'primary.dark' : 'white',
                          backgroundColor: scrolled ? 'rgba(2, 132, 199, 0.08)' : 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      Mi Perfil
                    </Button>
                  </Box>
                )}
              </Box>
            )}

            {/* Mobile Navigation */}
            {isMobile && (
              <IconButton 
                edge="start" 
                aria-label="menu" 
                onClick={toggleDrawer(true)}
                sx={{ 
                  color: scrolled ? 'primary.main' : 'white',
                  '&:hover': {
                    backgroundColor: scrolled 
                      ? 'rgba(2, 132, 199, 0.08)' 
                      : 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
        
        {/* Mobile Drawer */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {drawerContent}
        </Drawer>
      </AppBar>
    </Fade>
  );
}