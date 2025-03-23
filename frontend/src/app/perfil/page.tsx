'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
  Chip
} from '@mui/material';
import { 
  getCurrentUser, 
  updateProfile, 
  updateClientProfile, 
  UserProfile, 
  UpdateProfileData,
  UpdateClientProfileData
} from '@/api/authApi';

// Schema de validación para el perfil principal
const profileSchema = yup.object({
  first_name: yup.string().required('El nombre es requerido'),
  last_name: yup.string().required('El apellido es requerido'),
  phone_number: yup.string().required('El número de teléfono es requerido'),
  identification: yup.string(),
  address: yup.string(),
  occupation: yup.string()
}).required();

// Schema de validación para el perfil de cliente
const clientProfileSchema = yup.object({
  reference_name: yup.string(),
  reference_phone: yup.string(),
  reference_relationship: yup.string(),
  employer_name: yup.string(),
  employer_phone: yup.string(),
  employment_duration: yup.number().nullable().transform((v) => (isNaN(v) ? null : v)),
  has_existing_loans: yup.boolean()
}).required();

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  
  // Form para el perfil principal
  const { control: profileControl, handleSubmit: handleProfileSubmit, formState: { errors: profileErrors } } = useForm<UpdateProfileData>({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      identification: '',
      address: '',
      occupation: ''
    }
  });
  
  // Form para el perfil de cliente
  const { control: clientControl, handleSubmit: handleClientSubmit, formState: { errors: clientErrors } } = useForm<UpdateClientProfileData>({
    resolver: yupResolver(clientProfileSchema),
    defaultValues: {
      reference_name: '',
      reference_phone: '',
      reference_relationship: '',
      employer_name: '',
      employer_phone: '',
      employment_duration: null,
      has_existing_loans: false
    }
  });
  
  // Cargar los datos del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Verificar si hay token en localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        
        const userData = await getCurrentUser();
        setUserData(userData);
        
        // Actualizar valores de los formularios
        profileControl.reset({
          first_name: userData.first_name,
          last_name: userData.last_name,
          phone_number: userData.phone_number,
          identification: userData.identification,
          address: userData.address,
          occupation: userData.occupation
        });
        
        if (userData.client_profile) {
          clientControl.reset({
            reference_name: userData.client_profile.reference_name,
            reference_phone: userData.client_profile.reference_phone,
            reference_relationship: userData.client_profile.reference_relationship,
            employer_name: userData.client_profile.employer_name,
            employer_phone: userData.client_profile.employer_phone,
            employment_duration: userData.client_profile.employment_duration,
            has_existing_loans: userData.client_profile.has_existing_loans
          });
        }
      } catch (err) {
        console.error('Error al cargar datos de usuario:', err);
        setError('No se pudieron cargar los datos del usuario');
        // Redirigir al login si hay un error de autenticación
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [router]);
  
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const onSaveProfile = async (data: UpdateProfileData) => {
    setError(null);
    setSuccess(null);
    setSaveLoading(true);
    
    try {
      const updatedUser = await updateProfile(data);
      setUserData(updatedUser);
      setSuccess('Perfil actualizado exitosamente');
    } catch (err) {
      console.error('Error al actualizar perfil:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar perfil');
    } finally {
      setSaveLoading(false);
    }
  };
  
  const onSaveClientProfile = async (data: UpdateClientProfileData) => {
    setError(null);
    setSuccess(null);
    setSaveLoading(true);
    
    try {
      const updatedUser = await updateClientProfile(data);
      setUserData(updatedUser);
      setSuccess('Información adicional actualizada exitosamente');
    } catch (err) {
      console.error('Error al actualizar información adicional:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar información adicional');
    } finally {
      setSaveLoading(false);
    }
  };
  
  if (loading) {
    return (
      <Box className="min-h-screen flex items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <Container maxWidth="lg">
        {userData && (
          <Grid container spacing={4}>
            {/* Panel de información de usuario */}
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto flex items-center justify-center mb-4">
                    <Typography variant="h4" color="primary">
                      {userData.first_name.charAt(0)}{userData.last_name.charAt(0)}
                    </Typography>
                  </div>
                  
                  <Typography variant="h5" gutterBottom>
                    {userData.full_name}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    @{userData.username}
                  </Typography>
                  
                  {userData.is_verified ? (
                    <Chip label="Verificado" color="success" size="small" />
                  ) : (
                    <Chip label="No verificado" color="default" size="small" />
                  )}
                </Box>
                
                <Divider sx={{ my: 2 }} />
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Correo electrónico
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {userData.email}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                    Teléfono
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {userData.phone_number || 'No especificado'}
                  </Typography>
                  
                  {userData.identification && (
                    <>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Cédula/Pasaporte
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {userData.identification}
                      </Typography>
                    </>
                  )}
                </Box>
              </Paper>
            </Grid>
            
            {/* Formularios para edición */}
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Mi Perfil
                </Typography>
                
                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                )}
                
                {success && (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    {success}
                  </Alert>
                )}
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs value={tabValue} onChange={handleTabChange} aria-label="Perfil tabs">
                    <Tab label="Datos Personales" />
                    <Tab label="Información Adicional" />
                  </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                  <Box component="form" onSubmit={handleProfileSubmit(onSaveProfile)} noValidate>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="first_name"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Nombre"
                              error={!!profileErrors.first_name}
                              helperText={profileErrors.first_name?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="last_name"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Apellido"
                              error={!!profileErrors.last_name}
                              helperText={profileErrors.last_name?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="phone_number"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Teléfono"
                              error={!!profileErrors.phone_number}
                              helperText={profileErrors.phone_number?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="identification"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Cédula o Pasaporte"
                              error={!!profileErrors.identification}
                              helperText={profileErrors.identification?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="address"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Dirección"
                              multiline
                              rows={2}
                              error={!!profileErrors.address}
                              helperText={profileErrors.address?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="occupation"
                          control={profileControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Ocupación"
                              error={!!profileErrors.occupation}
                              helperText={profileErrors.occupation?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saveLoading}
                      >
                        {saveLoading ? <CircularProgress size={24} /> : 'Guardar Cambios'}
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                  <Box component="form" onSubmit={handleClientSubmit(onSaveClientProfile)} noValidate>
                    <Typography variant="subtitle1" gutterBottom>
                      Datos de Referencia
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="reference_name"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Nombre de referencia"
                              error={!!clientErrors.reference_name}
                              helperText={clientErrors.reference_name?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="reference_phone"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Teléfono de referencia"
                              error={!!clientErrors.reference_phone}
                              helperText={clientErrors.reference_phone?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Controller
                          name="reference_relationship"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Relación con la referencia"
                              error={!!clientErrors.reference_relationship}
                              helperText={clientErrors.reference_relationship?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    
                    <Typography variant="subtitle1" gutterBottom sx={{ mt: 4 }}>
                      Información Laboral
                    </Typography>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="employer_name"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Nombre del empleador"
                              error={!!clientErrors.employer_name}
                              helperText={clientErrors.employer_name?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="employer_phone"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Teléfono del empleador"
                              error={!!clientErrors.employer_phone}
                              helperText={clientErrors.employer_phone?.message}
                              disabled={saveLoading}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="employment_duration"
                          control={clientControl}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              fullWidth
                              label="Años en el empleo"
                              type="number"
                              error={!!clientErrors.employment_duration}
                              helperText={clientErrors.employment_duration?.message}
                              disabled={saveLoading}
                              inputProps={{ min: 0 }}
                            />
                          )}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={6}>
                        <Controller
                          name="has_existing_loans"
                          control={clientControl}
                          render={({ field }) => (
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={field.value}
                                  onChange={(e) => field.onChange(e.target.checked)}
                                  disabled={saveLoading}
                                />
                              }
                              label="¿Tiene préstamos existentes?"
                              sx={{ mt: 2 }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={saveLoading}
                      >
                        {saveLoading ? <CircularProgress size={24} /> : 'Guardar Información Adicional'}
                      </Button>
                    </Box>
                  </Box>
                </TabPanel>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Container>
    </div>
  );
} 