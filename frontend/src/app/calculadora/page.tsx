'use client';

import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import FinancingCalculator from '@/components/financing/FinancingCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calculadora de Financiamiento | LlévateloExpress',
  description: 'Calcula tus opciones de financiamiento para vehículos y maquinaria en Venezuela.',
};

const CalculadoraPage = () => {
  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Calculadora de Financiamiento
        </Typography>
        
        <Typography variant="body1" paragraph>
          Utiliza nuestra calculadora para explorar las diferentes opciones de financiamiento disponibles. 
          Selecciona el tipo de plan, ajusta el plazo y visualiza cuotas, cronogramas de pago y fechas de adjudicación.
        </Typography>
        
        <Paper sx={{ p: 3, mt: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Dos Modalidades de Financiamiento
          </Typography>
          
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={3}>
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Compra Programada
              </Typography>
              <Typography variant="body2">
                Comienza a pagar cuotas mensuales y cuando alcances el 45% del valor del vehículo, 
                se te entrega tu vehículo y continúas pagando las cuotas restantes.
              </Typography>
            </Box>
            
            <Box flex={1}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Adjudicación Inmediata
              </Typography>
              <Typography variant="body2">
                Recibes tu vehículo de inmediato realizando un pago inicial del 30% y financiando el resto 
                en cómodas cuotas mensuales.
              </Typography>
            </Box>
          </Box>
        </Paper>
        
        <Box mt={4}>
          <FinancingCalculator />
        </Box>
      </Box>
    </Container>
  );
};

export default CalculadoraPage; 