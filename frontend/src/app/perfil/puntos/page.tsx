'use client';

import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import PointsStatus from '@/components/points/PointsStatus';
import PointsHistory from '@/components/points/PointsHistory';
import { RequireAuth } from '@/components/auth/RequireAuth';

const PointsPage = () => {
  return (
    <RequireAuth>
      <Container maxWidth="lg">
        <Box mb={4}>
          <Breadcrumbs aria-label="breadcrumb">
            <Link href="/perfil" color="inherit">
              Mi Perfil
            </Link>
            <Typography color="textPrimary">Sistema de Puntos</Typography>
          </Breadcrumbs>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom>
          Mi Sistema de Puntos
        </Typography>
        
        <Typography variant="body1" color="textSecondary" paragraph>
          Tu puntuación determina los días de espera para la adjudicación. Mantén tus pagos al día para acumular puntos y reducir el tiempo de espera.
        </Typography>
        
        <Box mt={4}>
          <PointsStatus />
        </Box>
        
        <Box mt={4}>
          <PointsHistory />
        </Box>
      </Container>
    </RequireAuth>
  );
};

export default PointsPage; 