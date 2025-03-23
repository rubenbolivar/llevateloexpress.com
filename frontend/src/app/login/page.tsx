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
  CircularProgress
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { login } from '@/api/authApi';

// Schema de validación
const loginSchema = yup.object({
  username: yup.string().required('El usuario es requerido'),
  password: yup.string().required('La contraseña es requerida'),
}).required();

// Interfaz para el formulario
interface LoginFormData {
  username: string;
  password: string;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    }
  });
  
  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Llamada real a la API
      const result = await login(data);
      
      // Guardar tokens en localStorage
      localStorage.setItem('token', result.access);
      localStorage.setItem('refreshToken', result.refresh);
      
      // Redireccionar al perfil
      router.push('/perfil');
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" align="center" gutterBottom fontWeight="bold">
            Iniciar Sesión
          </Typography>
          
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Accede a tu cuenta para gestionar tus solicitudes y pagos
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  margin="normal"
                  fullWidth
                  label="Usuario o Email"
                  error={!!errors.username}
                  helperText={errors.username?.message}
                  disabled={isLoading}
                  autoFocus
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
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Iniciar Sesión'}
            </Button>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Link href="/recuperar-contrasena" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary" component="span">
                  ¿Olvidaste tu contraseña?
                </Typography>
              </Link>
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              ¿Aún no tienes cuenta?
            </Typography>
          </Divider>
          
          <Button
            component={Link}
            href="/registro"
            fullWidth
            variant="outlined"
            sx={{ py: 1.5 }}
          >
            Crear Cuenta
          </Button>
        </Paper>
      </Container>
    </div>
  );
} 