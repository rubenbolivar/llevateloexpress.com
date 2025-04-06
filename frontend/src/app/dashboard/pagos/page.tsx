'use client';

import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { 
  Card, CardContent, Box, Typography, Button, Chip, Stack, 
  TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
  Alert, Snackbar, Paper, Grid, IconButton, Tab, Tabs, Divider,
  Tooltip, InputAdornment
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { Pagination } from '@mui/material';
import Image from 'next/image';
import { formatCurrency, formatDate } from '@/lib/utils';
import { fetchPayments, verifyPayment, rejectPayment } from '@/api/payments';

const PaymentValidationPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadPayments();
  }, [filter, page, pageSize]);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const response = await fetchPayments({
        status: filter,
        page: page + 1,
        page_size: pageSize,
        search: searchQuery
      });
      setPayments(response.results);
      setTotalItems(response.count);
    } catch (err) {
      console.error('Error loading payments:', err);
      setError('No se pudieron cargar los pagos. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(0);
    loadPayments();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleVerifyPayment = async () => {
    try {
      await verifyPayment(selectedPayment.id, { notes });
      setSuccess('Pago verificado exitosamente');
      setVerifyDialogOpen(false);
      setDetailsOpen(false);
      setNotes('');
      loadPayments();
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('No se pudo verificar el pago. Intente nuevamente.');
    }
  };

  const handleRejectPayment = async () => {
    if (!notes.trim()) {
      setError('Debe proporcionar un motivo de rechazo');
      return;
    }
    
    try {
      await rejectPayment(selectedPayment.id, { notes });
      setSuccess('Pago rechazado exitosamente');
      setRejectDialogOpen(false);
      setDetailsOpen(false);
      setNotes('');
      loadPayments();
    } catch (err) {
      console.error('Error rejecting payment:', err);
      setError('No se pudo rechazar el pago. Intente nuevamente.');
    }
  };

  const viewPaymentDetails = (payment) => {
    setSelectedPayment(payment);
    setDetailsOpen(true);
  };

  const closeDetails = () => {
    setDetailsOpen(false);
    setSelectedPayment(null);
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'reference_number', headerName: 'Referencia', width: 150 },
    { 
      field: 'user', 
      headerName: 'Cliente', 
      width: 180,
      valueGetter: (params: GridValueGetterParams) => 
        `${params.row.user.first_name} ${params.row.user.last_name}` 
    },
    { 
      field: 'amount', 
      headerName: 'Monto', 
      width: 120, 
      valueFormatter: ({ value }) => formatCurrency(value) 
    },
    { 
      field: 'payment_date', 
      headerName: 'Fecha de Pago', 
      width: 130,
      valueFormatter: ({ value }) => formatDate(value)
    },
    { 
      field: 'payment_method', 
      headerName: 'Método', 
      width: 150,
      valueGetter: (params: GridValueGetterParams) => params.row.payment_method.name
    },
    { 
      field: 'payment_type', 
      headerName: 'Tipo', 
      width: 140,
      renderCell: (params: GridRenderCellParams) => {
        const types = {
          'regular': { label: 'Regular', color: 'primary' },
          'down_payment': { label: 'Inicial', color: 'secondary' },
          'adjudication': { label: 'Adjudicación', color: 'warning' },
          'extra': { label: 'Extra', color: 'success' }
        };
        
        const type = types[params.row.payment_type] || { label: params.row.payment_type, color: 'default' };
        
        return (
          <Chip 
            label={type.label} 
            color={type.color} 
            size="small" 
            variant="outlined"
          />
        );
      }
    },
    { 
      field: 'status', 
      headerName: 'Estado', 
      width: 130,
      renderCell: (params: GridRenderCellParams) => {
        const statusConfig = {
          'pending': { label: 'Pendiente', color: 'warning' },
          'verified': { label: 'Verificado', color: 'success' },
          'rejected': { label: 'Rechazado', color: 'error' }
        };
        
        return (
          <Chip 
            label={statusConfig[params.row.status].label} 
            color={statusConfig[params.row.status].color} 
            size="small"
          />
        );
      }
    },
    {
      field: 'actions',
      headerName: 'Acciones',
      width: 150,
      renderCell: (params: GridRenderCellParams) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="Ver detalles">
            <IconButton 
              size="small" 
              onClick={() => viewPaymentDetails(params.row)}
            >
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {params.row.status === 'pending' && (
            <>
              <Tooltip title="Verificar pago">
                <IconButton 
                  size="small" 
                  color="success"
                  onClick={() => {
                    setSelectedPayment(params.row);
                    setVerifyDialogOpen(true);
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Rechazar pago">
                <IconButton 
                  size="small" 
                  color="error"
                  onClick={() => {
                    setSelectedPayment(params.row);
                    setRejectDialogOpen(true);
                  }}
                >
                  <CancelIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Stack>
      )
    }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Validación de Pagos
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filtrar por Estado</InputLabel>
              <Select
                value={filter}
                label="Filtrar por Estado"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="pending">Pendientes</MenuItem>
                <MenuItem value="verified">Verificados</MenuItem>
                <MenuItem value="rejected">Rechazados</MenuItem>
                <MenuItem value="">Todos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Buscar por referencia o cliente"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSearch} edge="end">
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button 
              fullWidth 
              variant="outlined" 
              startIcon={<FilterListIcon />}
              onClick={handleSearch}
            >
              Filtrar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Card>
        <CardContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <DataGrid
                rows={payments}
                columns={columns}
                hideFooterPagination
                disableRowSelectionOnClick
                autoHeight
                getRowId={(row) => row.id}
                sx={{ minHeight: '500px' }}
              />
              
              <Box display="flex" justifyContent="center" p={2}>
                <Pagination
                  count={Math.ceil(totalItems / pageSize)}
                  page={page + 1}
                  onChange={(event, value) => setPage(value - 1)}
                />
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={closeDetails}
        maxWidth="md"
        fullWidth
      >
        {selectedPayment && (
          <>
            <DialogTitle>
              Detalles del Pago #{selectedPayment.reference_number}
              <Chip 
                label={selectedPayment.status === 'pending' ? 'Pendiente' : 
                      selectedPayment.status === 'verified' ? 'Verificado' : 'Rechazado'} 
                color={selectedPayment.status === 'pending' ? 'warning' : 
                      selectedPayment.status === 'verified' ? 'success' : 'error'} 
                size="small"
                sx={{ ml: 2 }}
              />
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Información del Pago</Typography>
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="body2" gutterBottom>
                    <strong>Cliente:</strong> {`${selectedPayment.user.first_name} ${selectedPayment.user.last_name}`}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Solicitud:</strong> {selectedPayment.application.reference_number}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Monto:</strong> {formatCurrency(selectedPayment.amount)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Fecha de Pago:</strong> {formatDate(selectedPayment.payment_date)}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Método de Pago:</strong> {selectedPayment.payment_method.name}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Tipo de Pago:</strong> {
                      selectedPayment.payment_type === 'regular' ? 'Regular' :
                      selectedPayment.payment_type === 'down_payment' ? 'Inicial' :
                      selectedPayment.payment_type === 'adjudication' ? 'Adjudicación' : 'Extra'
                    }
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    <strong>Fecha de Vencimiento:</strong> {selectedPayment.due_date ? formatDate(selectedPayment.due_date) : 'N/A'}
                  </Typography>
                  
                  {selectedPayment.status !== 'pending' && (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                        Detalles de Validación
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="body2" gutterBottom>
                        <strong>Validado por:</strong> {selectedPayment.verified_by ? 
                          `${selectedPayment.verified_by.first_name} ${selectedPayment.verified_by.last_name}` : 'N/A'}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        <strong>Fecha de Validación:</strong> {selectedPayment.verification_date ? 
                          formatDate(selectedPayment.verification_date) : 'N/A'}
                      </Typography>
                      {selectedPayment.status === 'rejected' && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Motivo de Rechazo:</strong> {selectedPayment.rejection_reason}
                        </Typography>
                      )}
                      {selectedPayment.notes && (
                        <Typography variant="body2" gutterBottom>
                          <strong>Notas:</strong> {selectedPayment.notes}
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" fontWeight="bold">Comprobante de Pago</Typography>
                  <Divider sx={{ my: 1 }} />
                  
                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    {selectedPayment.receipt ? (
                      <a href={selectedPayment.receipt} target="_blank" rel="noopener noreferrer">
                        <Image 
                          src={selectedPayment.receipt} 
                          alt="Comprobante" 
                          width={400} 
                          height={400} 
                          style={{ maxWidth: '100%', height: 'auto', objectFit: 'contain' }}
                        />
                      </a>
                    ) : (
                      <Typography color="text.secondary">
                        No hay comprobante disponible
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              {selectedPayment.status === 'pending' && (
                <>
                  <Button 
                    color="error" 
                    onClick={() => {
                      closeDetails();
                      setRejectDialogOpen(true);
                    }}
                  >
                    Rechazar
                  </Button>
                  <Button 
                    color="success" 
                    onClick={() => {
                      closeDetails();
                      setVerifyDialogOpen(true);
                    }}
                  >
                    Verificar
                  </Button>
                </>
              )}
              <Button onClick={closeDetails}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Verify Payment Dialog */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
      >
        <DialogTitle>Verificar Pago</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            ¿Está seguro que desea verificar este pago?
          </Typography>
          <TextField
            margin="dense"
            label="Notas (opcional)"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancelar</Button>
          <Button color="success" onClick={handleVerifyPayment}>Verificar Pago</Button>
        </DialogActions>
      </Dialog>

      {/* Reject Payment Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
      >
        <DialogTitle>Rechazar Pago</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            ¿Está seguro que desea rechazar este pago?
          </Typography>
          <TextField
            margin="dense"
            label="Motivo de rechazo *"
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            error={!notes.trim() && rejectDialogOpen}
            helperText={!notes.trim() && rejectDialogOpen ? "El motivo de rechazo es obligatorio" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancelar</Button>
          <Button color="error" onClick={handleRejectPayment}>Rechazar Pago</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars for notifications */}
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

export default PaymentValidationPage; 