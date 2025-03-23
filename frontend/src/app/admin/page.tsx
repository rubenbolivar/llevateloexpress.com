'use client';

import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Payment as PaymentIcon,
  Assignment as AssignmentIcon,
  BarChart as ChartIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import { useGetDashboardStatsQuery, useGetSalesStatsQuery } from '@/api/dashboardApi';
import { formatCurrency } from '@/lib/format';

// Colores para los gráficos
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const StatCard = ({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            sx={{
              bgcolor: `${color}`,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Grid>
        <Grid item xs>
          <Typography variant="h6" color="text.secondary" noWrap>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [salesPeriod, setSalesPeriod] = useState<string>('month');
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useGetDashboardStatsQuery();
  const { data: salesData, isLoading: isSalesLoading, error: salesError } = useGetSalesStatsQuery(salesPeriod);

  const handlePeriodChange = (event: SelectChangeEvent<string>) => {
    setSalesPeriod(event.target.value);
  };

  if (isStatsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (statsError) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error al cargar estadísticas. Por favor, intenta nuevamente.
      </Alert>
    );
  }

  // Transformar datos para el gráfico de solicitudes por estado
  const applicationStatusData = stats ? [
    { name: 'Pendientes', value: stats.applications.pending },
    { name: 'Aprobadas', value: stats.applications.approved },
    { name: 'Otras', value: stats.applications.total - stats.applications.pending - stats.applications.approved },
  ] : [];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Panel de Control
      </Typography>

      {/* Estadísticas principales */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Usuarios Totales"
            value={stats ? stats.users.total.toString() : '0'}
            icon={<PeopleIcon />}
            color="#3f51b5"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Solicitudes Pendientes"
            value={stats ? stats.applications.pending.toString() : '0'}
            icon={<AssignmentIcon />}
            color="#f44336"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pagos por Verificar"
            value={stats ? stats.payments.pending.toString() : '0'}
            icon={<PaymentIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ingresos Totales"
            value={stats ? formatCurrency(stats.payments.total_amount) : '$0'}
            icon={<TrendingUpIcon />}
            color="#4caf50"
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3}>
        {/* Gráfico de ventas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardHeader
              title="Ventas y Financiamientos"
              action={
                <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Período</InputLabel>
                  <Select<string>
                    value={salesPeriod}
                    onChange={handlePeriodChange}
                    label="Período"
                  >
                    <MenuItem value="week">Semana</MenuItem>
                    <MenuItem value="month">Mes</MenuItem>
                    <MenuItem value="year">Año</MenuItem>
                  </Select>
                </FormControl>
              }
            />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              {isSalesLoading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                  <CircularProgress />
                </Box>
              ) : salesError ? (
                <Alert severity="error">Error al cargar datos de ventas</Alert>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="amount" name="Monto" stroke="#8884d8" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="count" name="Cantidad" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de solicitudes por estado */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Solicitudes por Estado" />
            <Divider />
            <CardContent sx={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={applicationStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {applicationStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Cantidad']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones rápidas */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Acciones Rápidas" />
            <Divider />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => window.location.href = '/admin/solicitudes'}
                  >
                    Ver Solicitudes Pendientes
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="secondary"
                    onClick={() => window.location.href = '/admin/pagos'}
                  >
                    Validar Pagos
                  </Button>
                </Grid>
                <Grid item>
                  <Button 
                    variant="outlined" 
                    onClick={() => window.location.href = '/admin/productos/nuevo'}
                  >
                    Agregar Producto
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 