'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Tab,
  Tabs,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  FormHelperText,
  Chip,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import RestoreIcon from '@mui/icons-material/Restore';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PaymentIcon from '@mui/icons-material/Payment';
import PointsSystemIcon from '@mui/icons-material/EmojiEvents';

// Interfaces para la configuración
interface PointsConfig {
  initial_points: number;
  green_payment_points: number;
  yellow_payment_points: number;
  red_payment_points: number;
  early_payment_bonus: number;
  double_payment_bonus: number;
  education_course_bonus: number;
  excellent_threshold: number;
  good_threshold: number;
  average_threshold: number;
  poor_threshold: number;
}

interface FinancingConfig {
  programmed_down_payment_percentage: number;
  immediate_down_payment_percentage: number;
  max_financing_months: number;
  interest_rate: number;
  adjudication_percentage: number;
  adjudication_wait_days_tier1: number;
  adjudication_wait_days_tier2: number;
  adjudication_wait_days_tier3: number;
  adjudication_wait_days_tier4: number;
}

interface PaymentConfig {
  yellow_zone_days: number;
  red_zone_days: number;
  payment_reminder_days: number;
  grace_period_days: number;
  verification_timeout_hours: number;
}

interface SystemConfig {
  site_title: string;
  contact_email: string;
  contact_phone: string;
  company_address: string;
  currency_symbol: string;
  enable_registrations: boolean;
  maintenance_mode: boolean;
}

// Componente de pestañas
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`config-tabpanel-${index}`}
      aria-labelledby={`config-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// Página principal de Configuración
const ConfiguracionPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Estados para cada tipo de configuración
  const [pointsConfig, setPointsConfig] = useState<PointsConfig>({
    initial_points: 100,
    green_payment_points: 5,
    yellow_payment_points: 0,
    red_payment_points: -10,
    early_payment_bonus: 3,
    double_payment_bonus: 7,
    education_course_bonus: 10,
    excellent_threshold: 100,
    good_threshold: 80,
    average_threshold: 60,
    poor_threshold: 40,
  });

  const [financingConfig, setFinancingConfig] = useState<FinancingConfig>({
    programmed_down_payment_percentage: 20,
    immediate_down_payment_percentage: 30,
    max_financing_months: 48,
    interest_rate: 15,
    adjudication_percentage: 45,
    adjudication_wait_days_tier1: 0,
    adjudication_wait_days_tier2: 7,
    adjudication_wait_days_tier3: 15,
    adjudication_wait_days_tier4: 30,
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>({
    yellow_zone_days: 5,
    red_zone_days: 10,
    payment_reminder_days: 3,
    grace_period_days: 2,
    verification_timeout_hours: 24,
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    site_title: 'LlévateloExpress',
    contact_email: 'contacto@llevateloexpress.com',
    contact_phone: '+58 414-1234567',
    company_address: 'Caracas, Venezuela',
    currency_symbol: '$',
    enable_registrations: true,
    maintenance_mode: false,
  });

  // Cargar configuraciones al iniciar
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    setLoading(true);
    try {
      // En un sistema real, aquí cargaríamos datos desde la API
      // Por ahora, usamos datos de ejemplo
      
      // Simulamos una carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Para implementación real:
      // const pointsResponse = await fetch('/api/config/points');
      // setPointsConfig(await pointsResponse.json());
      // ...
      
    } catch (err) {
      console.error('Error cargando configuraciones:', err);
      setError('No se pudieron cargar las configuraciones. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePointsConfigChange = (field: keyof PointsConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPointsConfig({
      ...pointsConfig,
      [field]: Number(e.target.value),
    });
  };

  const handleFinancingConfigChange = (field: keyof FinancingConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFinancingConfig({
      ...financingConfig,
      [field]: Number(e.target.value),
    });
  };

  const handlePaymentConfigChange = (field: keyof PaymentConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentConfig({
      ...paymentConfig,
      [field]: Number(e.target.value),
    });
  };

  const handleSystemConfigChange = (field: keyof SystemConfig) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setSystemConfig({
      ...systemConfig,
      [field]: value,
    });
  };

  const saveConfigurations = async () => {
    setSaveLoading(true);
    try {
      // Simulamos una carga para guardar datos
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Aquí irían las llamadas a la API para guardar cada configuración
      // Por ejemplo:
      // await fetch('/api/config/points', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(pointsConfig),
      // });
      
      setSuccess('Configuraciones guardadas exitosamente');
    } catch (err) {
      console.error('Error al guardar configuraciones:', err);
      setError('No se pudieron guardar las configuraciones. Intente nuevamente.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Configuración del Sistema
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="configuración del sistema tabs"
          >
            <Tab 
              label="Sistema" 
              icon={<AdminPanelSettingsIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Puntos" 
              icon={<PointsSystemIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Financiamiento" 
              icon={<AccountBalanceWalletIcon />} 
              iconPosition="start"
            />
            <Tab 
              label="Pagos" 
              icon={<PaymentIcon />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Panel de Configuración del Sistema */}
        <TabPanel value={tabValue} index={0}>
          <Card>
            <CardHeader title="Información General" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Título del Sitio"
                    value={systemConfig.site_title}
                    onChange={handleSystemConfigChange('site_title')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Email de Contacto"
                    type="email"
                    value={systemConfig.contact_email}
                    onChange={handleSystemConfigChange('contact_email')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Teléfono de Contacto"
                    value={systemConfig.contact_phone}
                    onChange={handleSystemConfigChange('contact_phone')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Dirección de la Empresa"
                    value={systemConfig.company_address}
                    onChange={handleSystemConfigChange('company_address')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Símbolo de Moneda"
                    value={systemConfig.currency_symbol}
                    onChange={handleSystemConfigChange('currency_symbol')}
                    margin="normal"
                    inputProps={{ maxLength: 1 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardHeader title="Configuración del Sitio" />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemConfig.enable_registrations}
                        onChange={handleSystemConfigChange('enable_registrations')}
                        color="primary"
                      />
                    }
                    label="Habilitar Registros de Usuarios"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={systemConfig.maintenance_mode}
                        onChange={handleSystemConfigChange('maintenance_mode')}
                        color="warning"
                      />
                    }
                    label="Modo Mantenimiento"
                  />
                  <FormHelperText>
                    Cuando está activo, solo los administradores pueden acceder al sitio
                  </FormHelperText>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Configuración de Puntos */}
        <TabPanel value={tabValue} index={1}>
          <Card>
            <CardHeader 
              title="Configuración de Puntos"
              subheader="Define cómo funcionará el sistema de puntos para los clientes"
            />
            <Divider />
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Asignación de Puntos
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Puntos Iniciales"
                    type="number"
                    value={pointsConfig.initial_points}
                    onChange={handlePointsConfigChange('initial_points')}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Puntos al registrarse">
                          <IconButton edge="end" size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Pago Verde (Puntual)"
                    type="number"
                    value={pointsConfig.green_payment_points}
                    onChange={handlePointsConfigChange('green_payment_points')}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Puntos por pago a tiempo">
                          <IconButton edge="end" size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Pago Amarillo"
                    type="number"
                    value={pointsConfig.yellow_payment_points}
                    onChange={handlePointsConfigChange('yellow_payment_points')}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Puntos por pago con ligero retraso">
                          <IconButton edge="end" size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Pago Rojo"
                    type="number"
                    value={pointsConfig.red_payment_points}
                    onChange={handlePointsConfigChange('red_payment_points')}
                    margin="normal"
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="Puntos por pago muy retrasado">
                          <IconButton edge="end" size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                Bonificaciones
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Pago Anticipado"
                    type="number"
                    value={pointsConfig.early_payment_bonus}
                    onChange={handlePointsConfigChange('early_payment_bonus')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Pago Doble"
                    type="number"
                    value={pointsConfig.double_payment_bonus}
                    onChange={handlePointsConfigChange('double_payment_bonus')}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Curso Educativo"
                    type="number"
                    value={pointsConfig.education_course_bonus}
                    onChange={handlePointsConfigChange('education_course_bonus')}
                    margin="normal"
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                Umbrales de Clasificación
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Excelente"
                    type="number"
                    value={pointsConfig.excellent_threshold}
                    onChange={handlePointsConfigChange('excellent_threshold')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">≥</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Bueno"
                    type="number"
                    value={pointsConfig.good_threshold}
                    onChange={handlePointsConfigChange('good_threshold')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">≥</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Regular"
                    type="number"
                    value={pointsConfig.average_threshold}
                    onChange={handlePointsConfigChange('average_threshold')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">≥</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Deficiente"
                    type="number"
                    value={pointsConfig.poor_threshold}
                    onChange={handlePointsConfigChange('poor_threshold')}
                    margin="normal"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">≥</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Configuración de Financiamiento */}
        <TabPanel value={tabValue} index={2}>
          <Card>
            <CardHeader 
              title="Configuración de Financiamiento"
              subheader="Parámetros para los planes de financiamiento"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="% Inicial Compra Programada"
                    type="number"
                    value={financingConfig.programmed_down_payment_percentage}
                    onChange={handleFinancingConfigChange('programmed_down_payment_percentage')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="% Inicial Crédito Inmediato"
                    type="number"
                    value={financingConfig.immediate_down_payment_percentage}
                    onChange={handleFinancingConfigChange('immediate_down_payment_percentage')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Meses Máximos Financiamiento"
                    type="number"
                    value={financingConfig.max_financing_months}
                    onChange={handleFinancingConfigChange('max_financing_months')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">meses</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Tasa de Interés Anual"
                    type="number"
                    value={financingConfig.interest_rate}
                    onChange={handleFinancingConfigChange('interest_rate')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="% para Adjudicación"
                    type="number"
                    value={financingConfig.adjudication_percentage}
                    onChange={handleFinancingConfigChange('adjudication_percentage')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                Días de Espera para Adjudicación
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nivel Excelente"
                    type="number"
                    value={financingConfig.adjudication_wait_days_tier1}
                    onChange={handleFinancingConfigChange('adjudication_wait_days_tier1')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nivel Bueno"
                    type="number"
                    value={financingConfig.adjudication_wait_days_tier2}
                    onChange={handleFinancingConfigChange('adjudication_wait_days_tier2')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nivel Regular"
                    type="number"
                    value={financingConfig.adjudication_wait_days_tier3}
                    onChange={handleFinancingConfigChange('adjudication_wait_days_tier3')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Nivel Deficiente"
                    type="number"
                    value={financingConfig.adjudication_wait_days_tier4}
                    onChange={handleFinancingConfigChange('adjudication_wait_days_tier4')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Panel de Configuración de Pagos */}
        <TabPanel value={tabValue} index={3}>
          <Card>
            <CardHeader 
              title="Configuración de Pagos"
              subheader="Parámetros para el sistema de pagos y recordatorios"
            />
            <Divider />
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Días para Zona Amarilla"
                    type="number"
                    value={paymentConfig.yellow_zone_days}
                    onChange={handlePaymentConfigChange('yellow_zone_days')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                    helperText="Días de retraso para entrar en zona amarilla"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Días para Zona Roja"
                    type="number"
                    value={paymentConfig.red_zone_days}
                    onChange={handlePaymentConfigChange('red_zone_days')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                    helperText="Días de retraso para entrar en zona roja"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Recordatorio de Pago"
                    type="number"
                    value={paymentConfig.payment_reminder_days}
                    onChange={handlePaymentConfigChange('payment_reminder_days')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días antes</InputAdornment>,
                    }}
                    helperText="Días antes del vencimiento para enviar recordatorio"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Período de Gracia"
                    type="number"
                    value={paymentConfig.grace_period_days}
                    onChange={handlePaymentConfigChange('grace_period_days')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">días</InputAdornment>,
                    }}
                    helperText="Días de gracia después del vencimiento"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    label="Tiempo de Verificación"
                    type="number"
                    value={paymentConfig.verification_timeout_hours}
                    onChange={handlePaymentConfigChange('verification_timeout_hours')}
                    margin="normal"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">horas</InputAdornment>,
                    }}
                    helperText="Horas para verificar un pago después de reportado"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </TabPanel>

        {/* Botones de Acción */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="outlined" 
            startIcon={<RestoreIcon />}
            onClick={loadConfigurations}
            sx={{ mr: 2 }}
          >
            Restaurar
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            startIcon={<SaveIcon />}
            onClick={saveConfigurations}
            disabled={saveLoading}
          >
            {saveLoading ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </Box>
      </Paper>

      {/* Snackbars para notificaciones */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ConfiguracionPage; 