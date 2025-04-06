'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Divider,
  Chip,
  Button,
  TextField,
  IconButton,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Tab,
  Tabs,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Payment as PaymentIcon,
  AttachFile as AttachFileIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/format';

// Componente para mostrar información en formato etiqueta/valor
const InfoItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Box sx={{ mb: 2 }}>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

// Interfaz TabPanel
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

// Simulación de datos para la demostración
const MOCK_APPLICATION = {
  id: 2,
  user: {
    id: 2,
    username: 'maria.garcia',
    full_name: 'María García',
    email: 'maria.garcia@example.com',
    phone: '+58 412-555-1234',
    identification: 'V-12345678',
    address: 'Calle Principal #123, Caracas, Venezuela',
  },
  product: {
    id: 2,
    name: 'Honda Civic 2021',
    brand: 'Honda',
    model: 'Civic',
    year: 2021,
    price: 22000,
    category: 'Automóviles',
  },
  financing_plan: {
    id: 2,
    name: 'Plan Rápido',
    plan_type: 'immediate',
    description: 'Adjudicación inmediata con pago inicial del 30%',
    interest_rate: 12.5,
    min_term: 12,
    max_term: 60,
  },
  amount: 22000,
  down_payment: 6600,
  term_months: 24,
  monthly_payment: 1009.17,
  status: 'in_review',
  notes: 'Cliente interesado en entrega rápida. Verificar historial crediticio.',
  rejection_reason: null,
  created_at: '2023-03-09T11:20:00Z',
  updated_at: '2023-03-11T09:15:00Z',
  submitted_at: '2023-03-09T11:45:00Z',
  approved_at: null,
  rejected_at: null,
  status_history: [
    {
      id: 1,
      status: 'draft',
      notes: 'Solicitud creada en estado borrador',
      changed_by: {
        id: 2,
        username: 'maria.garcia',
        full_name: 'María García',
      },
      changed_at: '2023-03-09T11:20:00Z',
    },
    {
      id: 2,
      status: 'submitted',
      notes: 'Solicitud enviada para revisión',
      changed_by: {
        id: 2,
        username: 'maria.garcia',
        full_name: 'María García',
      },
      changed_at: '2023-03-09T11:45:00Z',
    },
    {
      id: 3,
      status: 'in_review',
      notes: 'Solicitud en proceso de revisión',
      changed_by: {
        id: 10,
        username: 'admin.user',
        full_name: 'Administrador Sistema',
      },
      changed_at: '2023-03-11T09:15:00Z',
    },
  ],
  documents: [
    {
      id: 1,
      document_type: 'id_card',
      file: '/documents/id_card_maria.pdf',
      description: 'Cédula de identidad',
      is_verified: true,
      uploaded_at: '2023-03-09T11:30:00Z',
    },
    {
      id: 2,
      document_type: 'income_proof',
      file: '/documents/income_maria.pdf',
      description: 'Comprobante de ingresos',
      is_verified: true,
      uploaded_at: '2023-03-09T11:32:00Z',
    },
    {
      id: 3,
      document_type: 'bank_statement',
      file: '/documents/bank_maria.pdf',
      description: 'Estado de cuenta bancario',
      is_verified: false,
      uploaded_at: '2023-03-09T11:35:00Z',
    },
  ],
  admin_notes: [
    {
      id: 1,
      note: 'Verificar referencias laborales',
      created_by: {
        id: 10,
        username: 'admin.user',
        full_name: 'Administrador Sistema',
      },
      created_at: '2023-03-11T09:20:00Z',
    },
  ],
};

// Mapeo de estados para mostrar en la UI
const STATUS_MAP = {
  draft: { label: 'Borrador', color: 'default' },
  submitted: { label: 'Enviada', color: 'info' },
  in_review: { label: 'En Revisión', color: 'primary' },
  additional_info_required: { label: 'Info. Adicional', color: 'warning' },
  approved: { label: 'Aprobada', color: 'success' },
  rejected: { label: 'Rechazada', color: 'error' },
  cancelled: { label: 'Cancelada', color: 'default' },
};

// Mapeo de tipos de documento
const DOCUMENT_TYPES = {
  id_card: 'Cédula de Identidad',
  income_proof: 'Comprobante de Ingresos',
  bank_statement: 'Estado de Cuenta Bancario',
  tax_return: 'Declaración de Impuestos',
  utility_bill: 'Factura de Servicios',
  reference_letter: 'Carta de Referencia',
  vehicle_images: 'Imágenes del Vehículo',
  other: 'Otro',
};

const ApplicationDetailPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(MOCK_APPLICATION);
  const [tabValue, setTabValue] = useState(0);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  // En un caso real, cargaríamos los datos de la solicitud desde la API
  // usando el ID proporcionado en params.id

  // Funciones para manejar los diálogos
  const handleApproveDialogOpen = () => {
    setApproveDialogOpen(true);
  };

  const handleApproveDialogClose = () => {
    setApproveDialogOpen(false);
  };

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
  };

  // Función para aprobar la solicitud
  const handleApprove = () => {
    // Aquí iría la lógica para aprobar la solicitud
    setApproveDialogOpen(false);
  };

  // Función para rechazar la solicitud
  const handleReject = () => {
    // Aquí iría la lógica para rechazar la solicitud
    setRejectDialogOpen(false);
  };

  // Función para añadir una nota de administrador
  const handleAddNote = () => {
    // Aquí iría la lógica para añadir la nota
    setAdminNote('');
  };

  // Función para cambiar de tab
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!application) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        No se encontró la solicitud.
      </Alert>
    );
  }

  const { status } = application;
  const { label, color } = STATUS_MAP[status as keyof typeof STATUS_MAP];

  // Determine si la solicitud está en un estado que puede ser aprobado o rechazado
  const canTakeAction = status === 'submitted' || status === 'in_review' || status === 'additional_info_required';

  return (
    <Box>
      {/* Encabezado */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box display="flex" alignItems="center">
          <IconButton onClick={() => router.push('/dashboard/solicitudes')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Solicitud #{application.id}
          </Typography>
          <Chip
            label={label}
            color={color as any}
            sx={{ ml: 2 }}
          />
        </Box>
        {canTakeAction && (
          <Box>
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              onClick={handleApproveDialogOpen}
              sx={{ mr: 1 }}
            >
              Aprobar
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CloseIcon />}
              onClick={handleRejectDialogOpen}
            >
              Rechazar
            </Button>
          </Box>
        )}
      </Box>

      {/* Pestañas */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="application tabs">
          <Tab icon={<InfoIcon />} label="Información" />
          <Tab icon={<AssignmentIcon />} label="Financiamiento" />
          <Tab icon={<PersonIcon />} label="Cliente" />
          <Tab icon={<AttachFileIcon />} label="Documentos" />
          <Tab icon={<HistoryIcon />} label="Historial" />
        </Tabs>
      </Box>

      {/* Pestaña de Información */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader title="Resumen de la Solicitud" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="ID" value={application.id} />
                    <InfoItem label="Estado" value={
                      <Chip
                        label={label}
                        color={color as any}
                        size="small"
                      />
                    } />
                    <InfoItem label="Fecha de Creación" value={formatDate(new Date(application.created_at))} />
                    <InfoItem label="Fecha de Envío" value={
                      application.submitted_at ? formatDate(new Date(application.submitted_at)) : 'N/A'
                    } />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Cliente" value={application.user.full_name} />
                    <InfoItem label="Producto" value={application.product.name} />
                    <InfoItem label="Plan de Financiamiento" value={
                      <>
                        {application.financing_plan.name}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {application.financing_plan.plan_type === 'programmed'
                            ? 'Compra Programada'
                            : 'Adjudicación Inmediata'}
                        </Typography>
                      </>
                    } />
                    <InfoItem label="Plazo" value={`${application.term_months} meses`} />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Notas" />
              <Divider />
              <CardContent>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Añadir una nota..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  disabled={!adminNote.trim()}
                  onClick={handleAddNote}
                >
                  Añadir Nota
                </Button>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Notas Anteriores
                </Typography>
                {application.admin_notes.length > 0 ? (
                  application.admin_notes.map((note) => (
                    <Box key={note.id} sx={{ mb: 2, pb: 2, borderBottom: '1px dashed #e0e0e0' }}>
                      <Typography variant="body2">{note.note}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Por {note.created_by.full_name} el {formatDate(new Date(note.created_at))}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay notas registradas.
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Pestaña de Financiamiento */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Card>
              <CardHeader title="Detalles del Financiamiento" />
              <Divider />
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Monto Total" value={formatCurrency(application.amount)} />
                    <InfoItem label="Plazo" value={`${application.term_months} meses`} />
                    <InfoItem label="Tasa de Interés" value={`${application.financing_plan.interest_rate}%`} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoItem label="Pago Inicial" value={formatCurrency(application.down_payment || 0)} />
                    <InfoItem label="Cuota Mensual" value={formatCurrency(application.monthly_payment)} />
                    <InfoItem label="Tipo de Plan" value={
                      application.financing_plan.plan_type === 'programmed'
                        ? 'Compra Programada (Adjudicación al 45%)'
                        : 'Adjudicación Inmediata'
                    } />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Card>
              <CardHeader title="Producto Financiado" />
              <Divider />
              <CardContent>
                <InfoItem label="Producto" value={application.product.name} />
                <InfoItem label="Marca" value={application.product.brand} />
                <InfoItem label="Modelo" value={application.product.model} />
                <InfoItem label="Año" value={application.product.year} />
                <InfoItem label="Precio" value={formatCurrency(application.product.price)} />
                <InfoItem label="Categoría" value={application.product.category} />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Pestaña de Cliente */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardHeader title="Información del Cliente" />
          <Divider />
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Nombre Completo" value={application.user.full_name} />
                <InfoItem label="Usuario" value={application.user.username} />
                <InfoItem label="Email" value={application.user.email} />
                <InfoItem label="Teléfono" value={application.user.phone} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <InfoItem label="Cédula" value={application.user.identification} />
                <InfoItem label="Dirección" value={application.user.address} />
                {/* Aquí podrían ir más datos del cliente como situación laboral, ingresos, etc. */}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Pestaña de Documentos */}
      <TabPanel value={tabValue} index={3}>
        <Card>
          <CardHeader title="Documentos Adjuntos" />
          <Divider />
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Tipo de Documento</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Fecha de Carga</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell align="center">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {application.documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>{DOCUMENT_TYPES[doc.document_type as keyof typeof DOCUMENT_TYPES]}</TableCell>
                      <TableCell>{doc.description}</TableCell>
                      <TableCell>{formatDate(new Date(doc.uploaded_at))}</TableCell>
                      <TableCell>
                        <Chip
                          label={doc.is_verified ? 'Verificado' : 'Pendiente'}
                          color={doc.is_verified ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<AttachFileIcon />}
                          href={doc.file}
                          target="_blank"
                        >
                          Ver
                        </Button>
                        {!doc.is_verified && (
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            Verificar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Pestaña de Historial */}
      <TabPanel value={tabValue} index={4}>
        <Card>
          <CardHeader title="Historial de Estados" />
          <Divider />
          <CardContent>
            <Stepper orientation="vertical">
              {application.status_history.map((history) => (
                <Step key={history.id} active={true} completed={true}>
                  <StepLabel>
                    <Typography variant="body1" fontWeight={500}>
                      {STATUS_MAP[history.status as keyof typeof STATUS_MAP].label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(new Date(history.changed_at))} por {history.changed_by.full_name}
                    </Typography>
                  </StepLabel>
                  <Box sx={{ ml: 2, mb: 2 }}>
                    <Typography variant="body2">{history.notes}</Typography>
                  </Box>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Diálogo de Aprobación */}
      <Dialog
        open={approveDialogOpen}
        onClose={handleApproveDialogClose}
        aria-labelledby="approve-dialog-title"
      >
        <DialogTitle id="approve-dialog-title">
          Aprobar Solicitud
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas aprobar esta solicitud de financiamiento?
            Esto generará un acuerdo de financiamiento y notificará al cliente.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleApproveDialogClose}>Cancelar</Button>
          <Button onClick={handleApprove} color="primary" variant="contained">
            Aprobar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Rechazo */}
      <Dialog
        open={rejectDialogOpen}
        onClose={handleRejectDialogClose}
        aria-labelledby="reject-dialog-title"
      >
        <DialogTitle id="reject-dialog-title">
          Rechazar Solicitud
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, proporciona una razón para el rechazo de esta solicitud.
            Esta información será visible para el cliente.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Razón del rechazo"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose}>Cancelar</Button>
          <Button
            onClick={handleReject}
            color="error"
            variant="contained"
            disabled={!rejectionReason.trim()}
          >
            Rechazar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApplicationDetailPage; 