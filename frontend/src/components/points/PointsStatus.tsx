import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  LinearProgress, 
  Box, 
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { useGetPointsBalanceQuery, useGetWaitingDaysQuery } from '@/api/pointsApi';

const PointsStatus: React.FC = () => {
  const { data: balanceData, isLoading: isBalanceLoading } = useGetPointsBalanceQuery();
  const { data: waitingData, isLoading: isWaitingLoading } = useGetWaitingDaysQuery();

  const isLoading = isBalanceLoading || isWaitingLoading;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!balanceData || !waitingData) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error al cargar la información de puntos.
      </Alert>
    );
  }

  // Calcular el porcentaje para la barra de progreso
  const nextThreshold = 
    balanceData.current_points < waitingData.thresholds.poor ? waitingData.thresholds.poor :
    balanceData.current_points < waitingData.thresholds.average ? waitingData.thresholds.average :
    balanceData.current_points < waitingData.thresholds.good ? waitingData.thresholds.good :
    balanceData.current_points < waitingData.thresholds.excellent ? waitingData.thresholds.excellent :
    waitingData.thresholds.excellent;

  const prevThreshold =
    balanceData.current_points < waitingData.thresholds.poor ? 0 :
    balanceData.current_points < waitingData.thresholds.average ? waitingData.thresholds.poor :
    balanceData.current_points < waitingData.thresholds.good ? waitingData.thresholds.average :
    balanceData.current_points < waitingData.thresholds.excellent ? waitingData.thresholds.good :
    waitingData.thresholds.good;

  const progressPercentage = ((balanceData.current_points - prevThreshold) / (nextThreshold - prevThreshold)) * 100;

  // Determinar el color de la barra de progreso
  const getProgressColor = (): "success" | "warning" | "error" | "primary" | "secondary" | "info" => {
    if (balanceData.current_points >= waitingData.thresholds.excellent) return "success";
    if (balanceData.current_points >= waitingData.thresholds.good) return "info";
    if (balanceData.current_points >= waitingData.thresholds.average) return "primary";
    if (balanceData.current_points >= waitingData.thresholds.poor) return "warning";
    return "error";
  };

  // Determinar el color del chip de estatus
  const getStatusColor = (): "success" | "warning" | "error" | "default" | "primary" | "secondary" | "info" => {
    switch(waitingData.status) {
      case "Excelente": return "success";
      case "Bueno": return "info";
      case "Promedio": return "primary";
      case "Bajo": return "warning";
      case "Crítico": return "error";
      default: return "default";
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Estado de Puntos
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                Puntos Actuales
              </Typography>
              <Typography variant="h4" color="primary">
                {balanceData.current_points}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Puntos acumulados: {balanceData.lifetime_points}
              </Typography>
            </Box>
            
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Progreso hacia el siguiente nivel
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progressPercentage > 100 ? 100 : progressPercentage} 
                color={getProgressColor()}
                sx={{ height: 10, borderRadius: 5 }}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography variant="body2">{prevThreshold}</Typography>
                <Typography variant="body2">{nextThreshold}</Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box mb={2}>
              <Typography variant="subtitle1" gutterBottom>
                Estado actual
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip 
                  label={waitingData.status} 
                  color={getStatusColor()} 
                />
                <Typography>
                  ({waitingData.waiting_days} días de espera)
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle2" gutterBottom>
              Días de espera por nivel
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2">Excelente: {waitingData.waiting_days_by_threshold.excellent} días</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Bueno: {waitingData.waiting_days_by_threshold.good} días</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Promedio: {waitingData.waiting_days_by_threshold.average} días</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Bajo: {waitingData.waiting_days_by_threshold.poor} días</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">Crítico: {waitingData.waiting_days_by_threshold.bad} días</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default PointsStatus; 