'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';
import PaymentIcon from '@mui/icons-material/Payment';
import CloseIcon from '@mui/icons-material/Close';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';

// Datos simulados para la demostración
const mockApplications = [
  {
    id: 1,
    reference_number: 'SOL-2023-0001',
    created_at: '2023-03-01T10:30:00',
    product: {
      id: 1,
      name: 'Honda CBR 250R',
      price: 5000,
      image: 'https://via.placeholder.com/150',
    },
    status: 'in_review',
    plan_type: 'programmed',
    plan_details: {
      down_payment: 1000,
      monthly_payment: 200,
      term_months: 24,
      adjudication_percentage: 45,
      interest_rate: 15,
    },
    documents: [
      { id: 1, name: 'Identificación', status: 'verified' },
      { id: 2, name: 'Comprobante de Domicilio', status: 'pending' },
      { id: 3, name: 'Comprobante de Ingresos', status: 'rejected' },
    ],
    status_history: [
      { status: 'draft', date: '2023-03-01T10:00:00', note: 'Solicitud creada' },
      { status: 'submitted', date: '2023-03-01T10:30:00', note: 'Documentos enviados' },
      { status: 'in_review', date: '2023-03-02T14:15:00', note: 'En revisión por el departamento financiero' },
    ],
    next_payment: {
      amount: 200,
      due_date: '2023-04-01',
    },
  },
  {
    id: 2,
    reference_number: 'SOL-2023-0002',
    created_at: '2023-02-15T09:45:00',
    product: {
      id: 2,
      name: 'Toyota Corolla 2020',
      price: 18000,
      image: 'https://via.placeholder.com/150',
    },
    status: 'approved',
    plan_type: 'immediate',
    plan_details: {
      down_payment: 5400,
      monthly_payment: 375,
      term_months: 36,
      interest_rate: 12,
    },
    documents: [
      { id: 4, name: 'Identificación', status: 'verified' },
      { id: 5, name: 'Comprobante de Domicilio', status: 'verified' },
      { id: 6, name: 'Comprobante de Ingresos', status: 'verified' },
      { id: 7, name: 'Referencias Bancarias', status: 'verified' },
    ],
    status_history: [
      { status: 'draft', date: '2023-02-15T09:00:00', note: 'Solicitud creada' },
      { status: 'submitted', date: '2023-02-15T09:45:00', note: 'Documentos enviados' },
      { status: 'in_review', date: '2023-02-16T11:30:00', note: 'En revisión por el departamento financiero' },
      { status: 'approved', date: '2023-02-20T15:20:00', note: 'Solicitud aprobada' },
    ],
    next_payment: {
      amount: 375,
      due_date: '2023-03-20',
    },
  },
  {
    id: 3,
    reference_number: 'SOL-2023-0003',
    created_at: '2023-01-20T14:00:00',
    product: {
      id: 3,
      name: 'Tractor Agrícola XR3000',
      price: 32000,
      image: 'https://via.placeholder.com/150',
    },
    status: 'rejected',
    plan_type: 'programmed',
    plan_details: {
      down_payment: 6400,
      monthly_payment: 533.33,
      term_months: 48,
      adjudication_percentage: 45,
      interest_rate: 15,
    },
    documents: [
      { id: 8, name: 'Identificación', status: 'verified' },
      { id: 9, name: 'Comprobante de Domicilio', status: 'verified' },
      { id: 10, name: 'Comprobante de Ingresos', status: 'rejected' },
    ],
    status_history: [
      { status: 'draft', date: '2023-01-20T13:30:00', note: 'Solicitud creada' },
      { status: 'submitted', date: '2023-01-20T14:00:00', note: 'Documentos enviados' },
      { status: 'in_review', date: '2023-01-21T10:15:00', note: 'En revisión por el departamento financiero' },
      { status: 'rejected', date: '2023-01-25T16:45:00', note: 'Ingresos insuficientes para el financiamiento solicitado' },
    ],
  },
];

// Mapa de estados para el stepper
const statusSteps = [
  { key: 'draft', label: 'Borrador' },
  { key: 'submitted', label: 'Enviada' },
  { key: 'in_review', label: 'En Revisión' },
  { key: 'approved', label: 'Aprobada' },
  { key: 'disbursed', label: 'Desembolsada' },
  { key: 'completed', label: 'Completada' },
];

// Mapa de configuración de color por estado
const statusConfig = {
  draft: { color: 'default', label: 'Borrador' },
  submitted: { color: 'primary', label: 'Enviada' },
  in_review: { color: 'warning', label: 'En Revisión' },
  approved: { color: 'success', label: 'Aprobada' },
  rejected: { color: 'error', label: 'Rechazada' },
  disbursed: { color: 'success', label: 'Desembolsada' },
  completed: { color: 'success', label: 'Completada' },
};

// Interfaz para pestañas
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
      id={`application-tabpanel-${index}`}
      aria-labelledby={`application-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const ApplicationsPage = () => {
  const [applications, setApplications] = useState(mockApplications);
  const [loading, setLoading] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    // En un sistema real, aquí cargaríamos los datos desde la API
    // Por ejemplo:
    // const fetchApplications = async () => {
    //   setLoading(true);
    //   try {
    //     const response = await fetch('/api/applications');
    //     const data = await response.json();
    //     setApplications(data);
    //   } catch (err) {
    //     setError('No se pudieron cargar las solicitudes');
    //   } finally {
    //     setLoading(false);
    //   }
    // };
    // fetchApplications();
    
    // Simulamos carga para la demo
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const viewApplicationDetails = (application) => {
    setSelectedApplication(application);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedApplication(null);
  };

  // Obtener el índice del estado actual en el stepper
  const getStatusIndex = (status) => {
    const index = statusSteps.findIndex(step => step.key === status);
    return index !== -1 ? index : (status === 'rejected' ? 2 : 0); // Si es rechazada, mostramos hasta "En Revisión"
  };

  // Determinar si la solicitud es rechazada
  const isRejected = (status) => status === 'rejected';

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Mis Solicitudes
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />}
          component={Link}
          href="/calculadora"
        >
          Nueva Solicitud
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes solicitudes de financiamiento
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Comienza calculando tu plan de financiamiento ideal y envía tu solicitud
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            component={Link}
            href="/calculadora"
          >
            Calcular Financiamiento
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {applications.map((app) => (
            <Grid item xs={12} md={6} lg={4} key={app.id}>
              <Card variant="outlined">
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography variant="h6" component="div" gutterBottom>
                      {app.product.name}
                    </Typography>
                    <Chip 
                      label={statusConfig[app.status].label} 
                      color={statusConfig[app.status].color}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Referencia: {app.reference_number}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Precio: {formatCurrency(app.product.price)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Plan: {app.plan_type === 'programmed' ? 'Compra Programada' : 'Crédito Inmediato'}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Fecha: {formatDate(app.created_at)}
                  </Typography>
                  
                  {app.next_payment && (
                    <Box mt={2} p={1} bgcolor="background.default" borderRadius={1}>
                      <Typography variant="body2" fontWeight="bold">
                        Próximo pago: {formatDate(app.next_payment.due_date)}
                      </Typography>
                      <Typography variant="body2">
                        Monto: {formatCurrency(app.next_payment.amount)}
                      </Typography>
                    </Box>
                  )}
                  
                  {/* Progress Stepper */}
                  <Box mt={3}>
                    <Stepper 
                      activeStep={getStatusIndex(app.status)} 
                      alternativeLabel
                      sx={{ 
                        '& .MuiStepConnector-root': { 
                          top: 10
                        },
                        '& .MuiStepIcon-root': {
                          fontSize: '1.2rem'
                        },
                        '& .MuiStepLabel-label': {
                          fontSize: '0.7rem',
                          marginTop: '4px'
                        }
                      }}
                    >
                      {statusSteps.slice(0, isRejected(app.status) ? 3 : statusSteps.length).map((step) => (
                        <Step key={step.key}>
                          <StepLabel>{step.label}</StepLabel>
                        </Step>
                      ))}
                    </Stepper>
                    
                    {isRejected(app.status) && (
                      <Typography 
                        variant="body2" 
                        color="error" 
                        textAlign="center" 
                        mt={1}
                      >
                        Solicitud Rechazada
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    onClick={() => viewApplicationDetails(app)}
                  >
                    Ver Detalles
                  </Button>
                  {app.status === 'draft' && (
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<FileUploadIcon />}
                    >
                      Completar
                    </Button>
                  )}
                  {app.status === 'in_review' && (
                    <Button 
                      size="small" 
                      color="primary" 
                      startIcon={<FileUploadIcon />}
                    >
                      Subir Documentos
                    </Button>
                  )}
                  {app.status === 'approved' && (
                    <Button 
                      size="small" 
                      color="success" 
                      startIcon={<PaymentIcon />}
                    >
                      Realizar Pago
                    </Button>
                  )}
                  {app.status === 'rejected' && (
                    <Button 
                      size="small" 
                      color="primary" 
                      component={Link}
                      href="/calculadora"
                    >
                      Nueva Solicitud
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de detalles de solicitud */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedApplication && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">
                  Solicitud {selectedApplication.reference_number}
                </Typography>
                <Box>
                  <Chip 
                    label={statusConfig[selectedApplication.status].label} 
                    color={statusConfig[selectedApplication.status].color}
                    size="small"
                    sx={{ mr: 2 }}
                  />
                  <IconButton size="small" onClick={closeDetails}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Detalles" />
                  <Tab label="Documentos" />
                  <Tab label="Historial" />
                </Tabs>
              </Box>

              {/* Panel de Detalles */}
              <TabPanel value={tabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Producto Solicitado
                        </Typography>
                        <Box 
                          component="img" 
                          src={selectedApplication.product.image} 
                          alt={selectedApplication.product.name}
                          sx={{ width: '100%', maxHeight: 200, objectFit: 'contain', mb: 2 }}
                        />
                        <Typography variant="body1" gutterBottom>
                          {selectedApplication.product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Precio: {formatCurrency(selectedApplication.product.price)}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                          Detalles del Plan
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Tipo de Plan:</strong> {
                            selectedApplication.plan_type === 'programmed' 
                              ? 'Compra Programada con Adjudicación al 45%' 
                              : 'Crédito de Adjudicación Inmediata'
                          }
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Inicial:</strong> {formatCurrency(selectedApplication.plan_details.down_payment)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Cuota Mensual:</strong> {formatCurrency(selectedApplication.plan_details.monthly_payment)}
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Plazo:</strong> {selectedApplication.plan_details.term_months} meses
                        </Typography>
                        <Typography variant="body2" gutterBottom>
                          <strong>Tasa de Interés:</strong> {selectedApplication.plan_details.interest_rate}% anual
                        </Typography>
                        {selectedApplication.plan_type === 'programmed' && (
                          <Typography variant="body2" gutterBottom>
                            <strong>Adjudicación al:</strong> {selectedApplication.plan_details.adjudication_percentage}%
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Progress Stepper */}
                <Box mt={4}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Estado de la Solicitud
                  </Typography>
                  <Stepper 
                    activeStep={getStatusIndex(selectedApplication.status)} 
                    alternativeLabel
                  >
                    {statusSteps.slice(0, isRejected(selectedApplication.status) ? 3 : statusSteps.length).map((step) => (
                      <Step key={step.key}>
                        <StepLabel>{step.label}</StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                  
                  {isRejected(selectedApplication.status) && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Solicitud rechazada: {
                        selectedApplication.status_history
                          .find(h => h.status === 'rejected')?.note || 'No se especificó motivo'
                      }
                    </Alert>
                  )}
                </Box>
              </TabPanel>

              {/* Panel de Documentos */}
              <TabPanel value={tabValue} index={1}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Documentos Requeridos
                </Typography>
                
                <List>
                  {selectedApplication.documents.map((doc) => (
                    <ListItem 
                      key={doc.id}
                      secondaryAction={
                        <Box>
                          {doc.status === 'pending' && (
                            <Tooltip title="Subir documento">
                              <IconButton edge="end" aria-label="upload">
                                <FileUploadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {doc.status === 'verified' && (
                            <Tooltip title="Descargar documento">
                              <IconButton edge="end" aria-label="download">
                                <DownloadIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      }
                    >
                      <ListItemText 
                        primary={doc.name} 
                        secondary={
                          <Chip 
                            label={
                              doc.status === 'verified' ? 'Verificado' :
                              doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'
                            }
                            color={
                              doc.status === 'verified' ? 'success' :
                              doc.status === 'rejected' ? 'error' : 'warning'
                            }
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                
                {selectedApplication.status === 'draft' || selectedApplication.status === 'in_review' ? (
                  <Box mt={3} textAlign="center">
                    <Button 
                      variant="contained" 
                      color="primary" 
                      startIcon={<FileUploadIcon />}
                    >
                      Subir Documentos Faltantes
                    </Button>
                  </Box>
                ) : null}
              </TabPanel>

              {/* Panel de Historial */}
              <TabPanel value={tabValue} index={2}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Historial de Estados
                </Typography>
                
                <List>
                  {selectedApplication.status_history.map((history, index) => (
                    <React.Fragment key={index}>
                      <ListItem>
                        <ListItemText 
                          primary={
                            <Box display="flex" alignItems="center">
                              <Chip 
                                label={statusConfig[history.status].label} 
                                color={statusConfig[history.status].color}
                                size="small"
                                sx={{ mr: 2 }}
                              />
                              <Typography variant="body2">
                                {formatDate(history.date, true)}
                              </Typography>
                            </Box>
                          }
                          secondary={history.note} 
                        />
                      </ListItem>
                      {index < selectedApplication.status_history.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button onClick={closeDetails}>Cerrar</Button>
              {selectedApplication.status === 'approved' && (
                <Button 
                  color="success" 
                  variant="contained"
                  startIcon={<PaymentIcon />}
                >
                  Realizar Pago
                </Button>
              )}
              {selectedApplication.status === 'rejected' && (
                <Button 
                  color="primary" 
                  variant="contained"
                  component={Link}
                  href="/calculadora"
                >
                  Nueva Solicitud
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default ApplicationsPage; 