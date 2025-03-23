'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Button, IconButton, Drawer, List, ListItem, 
        ListItemText, Box, Container, useMediaQuery, useTheme, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useAppSelector } from '@/hooks/reduxHooks';

interface NavLink {
  name: string;
  href: string;
}

const navLinks: NavLink[] = [
  { name: 'Inicio', href: '/' },
  { name: 'Catálogo', href: '/catalogo' },
  { name: 'Financiamiento', href: '/financiamiento' },
  { name: 'Calculadora', href: '/calculadora' },
  { name: 'Nosotros', href: '/nosotros' },
];

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
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
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navLinks.map((link) => (
          <ListItem 
            key={link.name} 
            component={Link} 
            href={link.href}
            sx={{ 
              color: pathname === link.href ? 'primary.main' : 'inherit',
              fontWeight: pathname === link.href ? 'bold' : 'normal'
            }}
          >
            <ListItemText primary={link.name} />
          </ListItem>
        ))}
        {!isAuthenticated ? (
          <>
            <ListItem component={Link} href="/login">
              <ListItemText primary="Iniciar Sesión" />
            </ListItem>
            <ListItem component={Link} href="/registro">
              <ListItemText primary="Registrarse" />
            </ListItem>
          </>
        ) : (
          <ListItem component={Link} href="/perfil">
            <ListItemText primary="Mi Perfil" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <AppBar 
      position="sticky" 
      elevation={scrolled ? 4 : 0}
      sx={{ 
        backgroundColor: scrolled ? 'white' : 'transparent',
        color: scrolled ? 'text.primary' : 'white',
        transition: 'all 0.3s',
        borderBottom: scrolled ? '1px solid #e0e0e0' : 'none'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', py: 1.5 }}>
              {/* Replace with your logo */}
              <Box 
                sx={{ 
                  fontWeight: 'bold', 
                  fontSize: '1.5rem', 
                  fontFamily: 'Poppins, sans-serif',
                  color: scrolled ? 'primary.main' : 'inherit'
                }}
              >
                LlévateloExpress
              </Box>
            </Box>
          </Link>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {navLinks.map((link) => (
                <Button
                  key={link.name}
                  component={Link}
                  href={link.href}
                  sx={{
                    color: scrolled ? (pathname === link.href ? 'primary.main' : 'text.primary') : 'inherit',
                    fontWeight: pathname === link.href ? 'bold' : 'normal',
                    '&:hover': {
                      color: scrolled ? 'primary.main' : 'primary.light',
                      backgroundColor: 'transparent'
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
                    component={Link} 
                    href="/login"
                    color={scrolled ? 'primary' : 'inherit'}
                    variant={scrolled ? 'outlined' : 'text'}
                  >
                    Iniciar Sesión
                  </Button>
                  <Button 
                    component={Link} 
                    href="/registro" 
                    color={scrolled ? 'primary' : 'inherit'}
                    variant="contained"
                    sx={{ color: scrolled ? 'white' : 'inherit' }}
                  >
                    Registrarse
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Button 
                    component={Link} 
                    href="/perfil"
                    color={scrolled ? 'primary' : 'inherit'}
                    endIcon={user?.first_name ? (
                      <Avatar 
                        sx={{ width: 32, height: 32 }}
                      >
                        {user.first_name.charAt(0)}
                      </Avatar>
                    ) : null}
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
              color="inherit" 
              aria-label="menu" 
              onClick={toggleDrawer(true)}
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
  );
} 