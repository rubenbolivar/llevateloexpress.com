'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Divider,
  InputAdornment,
  IconButton,
  Alert,
  CircularProgress,
  Grid,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { RegistrationData, register } from '@/api/authApi';

// Schema de validación
const registerSchema = yup.object({
  username: yup.string()
    .required('El nombre de usuario es requerido')
    .min(4, 'El nombre de usuario debe tener al menos 4 caracteres'),
  email: yup.string()
    .required('El correo electrónico es requerido')
    .email('Ingrese un correo electrónico válido'),
  password: yup.string()
    .required('La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
  password_confirm: yup.string()
    .required('Debe confirmar su contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  first_name: yup.string()
    .required('El nombre es requerido'),
  last_name: yup.string()
    .required('El apellido es requerido'),
  phone_number: yup.string()
    .required('El número de teléfono es requerido')
}).required();

const steps = ['Datos de acceso', 'Datos personales'];

export default function RegistroPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const router = useRouter();
  
  const { control, handleSubmit, trigger, formState: { errors, isValid }, getValues } = useForm<RegistrationData>({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      password_confirm: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      identification: '',
      address: '',
      occupation: ''
    },
    mode: 'onChange'
  });
  
  const handleNext = async () => {
    const fieldsToValidate = activeStep === 0 
      ? ['username', 'email', 'password', 'password_confirm']
      : ['first_name', 'last_name', 'phone_number'];
    
    const isStepValid = await trigger(fieldsToValidate as any);
    
    if (isStepValid) {
      setActiveStep((prev) => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };
  
  const onSubmit = async (data: RegistrationData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await register(data);
      setRegistrationSuccess(true);
      
      // Esperar 3 segundos y luego redirigir a login
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (err) {
      console.error('Error al registrar usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 py-8">
      <Container maxWidth="md">
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Crear Cuenta
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Regístrate para acceder a todas las funcionalidades de LlévateloExpress
          </Typography>
          
          {registrationSuccess ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              ¡Registro exitoso! Serás redirigido a la página de inicio de sesión en unos segundos...
            </Alert>
          ) : (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}
              
              <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
              
              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                {activeStep === 0 ? (
                  // Paso 1: Datos de acceso
                  <>
                    <Controller
                      name="username"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          fullWidth
                          label="Nombre de Usuario"
                          error={!!errors.username}
                          helperText={errors.username?.message}
                          disabled={isLoading}
                          autoFocus
                        />
                      )}
                    />
                    
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          fullWidth
                          label="Correo Electrónico"
                          type="email"
                          error={!!errors.email}
                          helperText={errors.email?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                    
                    <Controller
                      name="password"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          fullWidth
                          label="Contraseña"
                          type={showPassword ? 'text' : 'password'}
                          error={!!errors.password}
                          helperText={errors.password?.message}
                          disabled={isLoading}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton
                                  aria-label="toggle password visibility"
                                  onClick={toggleShowPassword}
                                  edge="end"
                                >
                                  {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                </IconButton>
                              </InputAdornment>
                            )
                          }}
                        />
                      )}
                    />
                    
                    <Controller
                      name="password_confirm"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          margin="normal"
                          fullWidth
                          label="Confirmar Contraseña"
                          type={showPassword ? 'text' : 'password'}
                          error={!!errors.password_confirm}
                          helperText={errors.password_confirm?.message}
                          disabled={isLoading}
                        />
                      )}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={isLoading}
                      >
                        Siguiente
                      </Button>
                    </Box>
                  </>
                ) : (
                  // Paso 2: Datos personales
                  <>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="first_name"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Nombre"
                              error={!!errors.first_name}
                              helperText={errors.first_name?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="last_name"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Apellido"
                              error={!!errors.last_name}
                              helperText={errors.last_name?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="phone_number"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Número de Teléfono"
                              error={!!errors.phone_number}
                              helperText={errors.phone_number?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="identification"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Cédula o Pasaporte (Opcional)"
                              error={!!errors.identification}
                              helperText={errors.identification?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="address"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Dirección (Opcional)"
                              multiline
                              rows={2}
                              error={!!errors.address}
                              helperText={errors.address?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="occupation"
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              margin="normal"
                              fullWidth
                              label="Ocupación (Opcional)"
                              error={!!errors.occupation}
                              helperText={errors.occupation?.message}
                              disabled={isLoading}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                      <Button
                        onClick={handleBack}
                        disabled={isLoading}
                      >
                        Atrás
                      </Button>
                      
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={isLoading}
                      >
                        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Crear Cuenta'}
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
              
              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  ¿Ya tienes una cuenta?
                </Typography>
              </Divider>
              
              <Button
                component={Link}
                href="/login"
                fullWidth
                variant="outlined"
                sx={{ py: 1.5 }}
                disabled={isLoading}
              >
                Iniciar Sesión
              </Button>
            </>
          )}
        </Paper>
      </Container>
    </div>
  );
} 