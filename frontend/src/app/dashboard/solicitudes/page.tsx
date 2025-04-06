'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  TextField,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatDate, formatCurrency } from '@/lib/format';

// Simulación de datos para la demostración
const MOCK_APPLICATIONS = [
  {
    id: 1,
    user: {
      id: 1,
      username: 'juan.perez',
      full_name: 'Juan Pérez',
    },
    product: {
      id: 1,
      name: 'Toyota Corolla 2022',
      price: 25000,
    },
    financing_plan: {
      id: 1,
      name: 'Plan Básico',
      plan_type: 'programmed',
    },
    amount: 25000,
    term_months: 36,
    monthly_payment: 833.33,
    status: 'submitted',
    created_at: '2023-03-10T15:30:00Z',
    updated_at: '2023-03-10T15:30:00Z',
  },
  {
    id: 2,
    user: {
      id: 2,
      username: 'maria.garcia',
      full_name: 'María García',
    },
    product: {
      id: 2,
      name: 'Honda Civic 2021',
      price: 22000,
    },
    financing_plan: {
      id: 2,
      name: 'Plan Rápido',
      plan_type: 'immediate',
    },
    amount: 22000,
    term_months: 24,
    monthly_payment: 1009.17,
    status: 'in_review',
    created_at: '2023-03-09T11:20:00Z',
    updated_at: '2023-03-11T09:15:00Z',
  },
  {
    id: 3,
    user: {
      id: 3,
      username: 'pedro.ramirez',
      full_name: 'Pedro Ramírez',
    },
    product: {
      id: 3,
      name: 'Nissan Sentra 2022',
      price: 21000,
    },
    financing_plan: {
      id: 1,
      name: 'Plan Básico',
      plan_type: 'programmed',
    },
    amount: 21000,
    term_months: 48,
    monthly_payment: 525.00,
    status: 'approved',
    created_at: '2023-03-05T14:45:00Z',
    updated_at: '2023-03-12T10:30:00Z',
  },
  {
    id: 4,
    user: {
      id: 4,
      username: 'ana.lopez',
      full_name: 'Ana López',
    },
    product: {
      id: 4,
      name: 'Ford Focus 2021',
      price: 19500,
    },
    financing_plan: {
      id: 2,
      name: 'Plan Rápido',
      plan_type: 'immediate',
    },
    amount: 19500,
    term_months: 36,
    monthly_payment: 597.22,
    status: 'rejected',
    created_at: '2023-03-08T16:10:00Z',
    updated_at: '2023-03-13T11:45:00Z',
  },
  {
    id: 5,
    user: {
      id: 5,
      username: 'carlos.gomez',
      full_name: 'Carlos Gómez',
    },
    product: {
      id: 5,
      name: 'Chevrolet Cruze 2022',
      price: 20000,
    },
    financing_plan: {
      id: 1,
      name: 'Plan Básico',
      plan_type: 'programmed',
    },
    amount: 20000,
    term_months: 60,
    monthly_payment: 400.00,
    status: 'additional_info_required',
    created_at: '2023-03-07T09:30:00Z',
    updated_at: '2023-03-14T14:20:00Z',
  },
];

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

const SolicitudesPage = () => {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);

  // Función para manejar el cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Función para manejar el cambio de filas por página
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función para filtrar solicitudes
  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.id.toString().includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Función para ver detalles de una solicitud
  const handleViewApplication = (id: number) => {
    router.push(`/admin/solicitudes/${id}`);
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Gestión de Solicitudes
      </Typography>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Buscar por nombre, producto o ID"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as string)}
                label="Estado"
              >
                <MenuItem value="all">Todos</MenuItem>
                {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                  <MenuItem key={key} value={key}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} container justifyContent="flex-end">
            <Button variant="contained" startIcon={<FilterIcon />}>
              Más Filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabla de solicitudes */}
      {loading ? (
        <Box display="flex" justifyContent="center" my={4}>
          <CircularProgress />
        </Box>
      ) : applications.length === 0 ? (
        <Alert severity="info">No hay solicitudes para mostrar.</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Producto</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell align="right">Monto</TableCell>
                  <TableCell align="right">Plazo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell align="center">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((application) => {
                    const { status } = application;
                    const { label, color } = STATUS_MAP[status as keyof typeof STATUS_MAP];

                    return (
                      <TableRow key={application.id} hover>
                        <TableCell>{application.id}</TableCell>
                        <TableCell>{application.user.full_name}</TableCell>
                        <TableCell>{application.product.name}</TableCell>
                        <TableCell>
                          {application.financing_plan.name}
                          <Typography variant="caption" display="block" color="text.secondary">
                            {application.financing_plan.plan_type === 'programmed'
                              ? 'Compra Programada'
                              : 'Adjudicación Inmediata'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">{formatCurrency(application.amount)}</TableCell>
                        <TableCell align="right">{application.term_months} meses</TableCell>
                        <TableCell>
                          <Chip
                            label={label}
                            color={color as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(new Date(application.created_at))}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleViewApplication(application.id)}
                            title="Ver detalles"
                          >
                            <ViewIcon />
                          </IconButton>
                          {status === 'submitted' || status === 'in_review' || status === 'additional_info_required' ? (
                            <>
                              <IconButton color="success" title="Aprobar">
                                <ApproveIcon />
                              </IconButton>
                              <IconButton color="error" title="Rechazar">
                                <RejectIcon />
                              </IconButton>
                            </>
                          ) : null}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredApplications.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
        </Paper>
      )}
    </Box>
  );
};

export default SolicitudesPage; 