import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Divider,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Slider,
  FormHelperText,
  InputAdornment,
} from '@mui/material';
import { 
  useGetFinancingPlansQuery, 
  useCalculateFinancingMutation, 
  useSaveSimulationMutation,
  FinancingPlan,
  FinancingCalculatorResult
} from '@/api/financingApi';
import { formatCurrency } from '@/lib/format';

interface FinancingCalculatorProps {
  productId?: number;
  productPrice?: number;
  productName?: string;
}

const FinancingCalculator: React.FC<FinancingCalculatorProps> = ({
  productId,
  productPrice,
  productName,
}) => {
  // Estados para el formulario
  const [planType, setPlanType] = useState<'programmed' | 'immediate'>('programmed');
  const [selectedPlanId, setSelectedPlanId] = useState<number | ''>('');
  const [termMonths, setTermMonths] = useState<number>(24);
  const [downPayment, setDownPayment] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  
  // Estado para resultados
  const [result, setResult] = useState<FinancingCalculatorResult | null>(null);
  
  // Estados para pestañas
  const [tabIndex, setTabIndex] = useState(0);
  
  // Consultar planes de financiamiento
  const { 
    data: plans, 
    isLoading: isLoadingPlans, 
    error: plansError 
  } = useGetFinancingPlansQuery();
  
  // Mutation para calcular financiamiento
  const [
    calculateFinancing, 
    { isLoading: isCalculating, error: calculationError }
  ] = useCalculateFinancingMutation();
  
  // Mutation para guardar simulación
  const [
    saveSimulation, 
    { isLoading: isSaving, isSuccess: isSaved, error: saveError }
  ] = useSaveSimulationMutation();
  
  // Efectos para cargar datos iniciales
  useEffect(() => {
    if (productPrice) {
      setPrice(productPrice);
    }
  }, [productPrice]);
  
  // Filtrar planes según el tipo seleccionado
  const filteredPlans = plans?.filter(plan => plan.plan_type === planType) || [];
  
  // Obtener el plan seleccionado
  const selectedPlan = plans?.find(p => p.id === selectedPlanId) as FinancingPlan | undefined;
  
  // Calcular pago inicial mínimo para planes de adjudicación inmediata
  const minDownPayment = selectedPlan && selectedPlan.plan_type === 'immediate' && price
    ? (price * selectedPlan.down_payment_percentage) / 100
    : 0;
  
  // Manejar cambio de tipo de plan
  const handlePlanTypeChange = (event: React.ChangeEvent<{}>, newValue: 'programmed' | 'immediate') => {
    setPlanType(newValue);
    setSelectedPlanId('');
    setResult(null);
  };
  
  // Manejar cambio de pestaña en resultados
  const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
  };
  
  // Calcular financiamiento
  const handleCalculate = async () => {
    if (!selectedPlanId || !price || price <= 0 || !termMonths) {
      return;
    }
    
    try {
      const calculationData = {
        product_id: productId || 0,
        plan_id: selectedPlanId as number,
        term_months: termMonths,
        ...(planType === 'immediate' && downPayment ? { down_payment: Number(downPayment) } : {})
      };
      
      const response = await calculateFinancing(calculationData).unwrap();
      setResult(response);
      setTabIndex(0); // Mostrar resumen después del cálculo
    } catch (error) {
      console.error('Error al calcular financiamiento:', error);
    }
  };
  
  // Guardar simulación
  const handleSaveSimulation = async () => {
    if (!result) return;
    
    try {
      await saveSimulation(result).unwrap();
    } catch (error) {
      console.error('Error al guardar simulación:', error);
    }
  };
  
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Calculadora de Financiamiento
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box mb={4}>
        <Tabs
          value={planType}
          onChange={handlePlanTypeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Compra Programada" value="programmed" />
          <Tab label="Adjudicación Inmediata" value="immediate" />
        </Tabs>
        
        {planType === 'programmed' && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Adjudicación al 45% del valor del vehículo
          </Typography>
        )}
        
        {planType === 'immediate' && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Adjudicación inmediata con pago inicial
          </Typography>
        )}
      </Box>
      
      <Grid container spacing={3}>
        {/* Formulario de cálculo */}
        <Grid item xs={12} md={5}>
          <Box component="form" noValidate>
            <Grid container spacing={2}>
              {/* Precio del vehículo */}
              <Grid item xs={12}>
                <TextField
                  label="Precio del vehículo"
                  fullWidth
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  disabled={Boolean(productPrice)}
                  helperText={productName ? `Vehículo: ${productName}` : ''}
                />
              </Grid>
              
              {/* Plan de financiamiento */}
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Plan de financiamiento</InputLabel>
                  <Select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value as number)}
                    label="Plan de financiamiento"
                    disabled={isLoadingPlans}
                  >
                    {filteredPlans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {selectedPlan && (
                    <FormHelperText>
                      {selectedPlan.min_term} - {selectedPlan.max_term} meses, 
                      {planType === 'immediate' 
                        ? ` ${selectedPlan.down_payment_percentage}% pago inicial` 
                        : ` Adjudicación al ${selectedPlan.adjudication_percentage}%`}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
              
              {/* Plazo en meses */}
              <Grid item xs={12}>
                <Typography gutterBottom>
                  Plazo: {termMonths} meses
                </Typography>
                <Slider
                  value={termMonths}
                  onChange={(e, newValue) => setTermMonths(newValue as number)}
                  min={selectedPlan?.min_term || 12}
                  max={selectedPlan?.max_term || 60}
                  step={1}
                  marks={[
                    { value: selectedPlan?.min_term || 12, label: `${selectedPlan?.min_term || 12}` },
                    { value: selectedPlan?.max_term || 60, label: `${selectedPlan?.max_term || 60}` }
                  ]}
                  valueLabelDisplay="auto"
                  disabled={!selectedPlan}
                />
              </Grid>
              
              {/* Pago inicial (solo para adjudicación inmediata) */}
              {planType === 'immediate' && (
                <Grid item xs={12}>
                  <TextField
                    label="Pago inicial"
                    fullWidth
                    required
                    value={downPayment}
                    onChange={(e) => setDownPayment(e.target.value ? Number(e.target.value) : '')}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    disabled={!selectedPlan}
                    helperText={minDownPayment > 0 
                      ? `Mínimo: ${formatCurrency(minDownPayment)} (${selectedPlan?.down_payment_percentage}%)` 
                      : ''}
                    error={Boolean(downPayment && downPayment < minDownPayment)}
                  />
                </Grid>
              )}
              
              {/* Botón de calcular */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  onClick={handleCalculate}
                  disabled={!selectedPlanId || !price || (planType === 'immediate' && (!downPayment || downPayment < minDownPayment)) || isCalculating}
                >
                  {isCalculating ? <CircularProgress size={24} /> : 'Calcular'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Grid>
        
        {/* Resultados */}
        <Grid item xs={12} md={7}>
          {calculationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error al calcular. Por favor verifica los datos ingresados.
            </Alert>
          )}
          
          {isSaved && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Simulación guardada correctamente.
            </Alert>
          )}
          
          {result && (
            <Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabIndex} onChange={handleTabChange}>
                  <Tab label="Resumen" />
                  <Tab label="Cronograma" />
                </Tabs>
              </Box>
              
              {tabIndex === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Resumen del Financiamiento
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Tipo de plan:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        {result.plan.type === 'programmed' ? 'Compra Programada' : 'Adjudicación Inmediata'}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Plazo:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        {result.financing_details.term_months} meses
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Cuota mensual:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(result.financing_details.monthly_payment)}
                      </Typography>
                    </Grid>
                    
                    {result.plan.type === 'programmed' && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Mes de adjudicación:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {result.financing_details.adjudication_month}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Pago de adjudicación:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {formatCurrency(result.financing_details.adjudication_payment || 0)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    {result.plan.type === 'immediate' && (
                      <>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Pago inicial:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {formatCurrency(result.financing_details.down_payment || 0)}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={6}>
                          <Typography variant="body2" color="textSecondary">
                            Monto financiado:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {formatCurrency(result.financing_details.financed_amount || 0)}
                          </Typography>
                        </Grid>
                      </>
                    )}
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Interés total:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1">
                        {formatCurrency(result.financing_details.total_interest)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">
                        Monto total a pagar:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body1" fontWeight="bold">
                        {formatCurrency(result.financing_details.total_amount)}
                      </Typography>
                    </Grid>
                  </Grid>
                  
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 3 }}
                    onClick={handleSaveSimulation}
                    disabled={isSaving}
                  >
                    {isSaving ? <CircularProgress size={24} /> : 'Guardar simulación'}
                  </Button>
                </Box>
              )}
              
              {tabIndex === 1 && (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="h6" gutterBottom>
                    Cronograma de Pagos
                  </Typography>
                  
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>N°</th>
                        <th style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>Fecha</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Capital</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Interés</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Cuota</th>
                        <th style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.payment_schedule.map((payment) => (
                        <tr key={payment.payment_number} style={{ 
                          backgroundColor: payment.is_adjudication ? '#e3f2fd' : 'transparent'
                        }}>
                          <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            {payment.payment_number}
                            {payment.is_adjudication && ' (Adjudicación)'}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                            {new Date(payment.payment_date).toLocaleDateString()}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(payment.principal)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(payment.interest)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(payment.total_payment)}
                          </td>
                          <td style={{ padding: '8px', textAlign: 'right', borderBottom: '1px solid #ddd' }}>
                            {formatCurrency(payment.remaining_balance)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Box>
              )}
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default FinancingCalculator; 