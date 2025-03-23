import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Pagination,
  Box,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useGetPointTransactionsQuery } from '@/api/pointsApi';

// Mapeo de tipos de transacción a nombres legibles
const transactionTypeMap: Record<string, string> = {
  'initial': 'Puntos Iniciales',
  'on_time_payment': 'Pago a Tiempo',
  'late_payment': 'Pago con Retraso (1-5 días)',
  'very_late_payment': 'Pago con Retraso (>5 días)',
  'advance_payment': 'Pago Anticipado',
  'double_payment': 'Pago Doble',
  'educational_course': 'Curso Educativo',
  'manual_adjustment': 'Ajuste Manual',
};

// Colores según el tipo de transacción
const getChipColor = (type: string, amount: number): 'success' | 'warning' | 'error' | 'default' => {
  if (amount > 0) return 'success';
  if (amount < 0) return 'error';
  return 'default';
};

const PointsHistory: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useGetPointTransactionsQuery({ page, pageSize: 10 });

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        Error al cargar el historial de puntos. Por favor, intenta de nuevo más tarde.
      </Alert>
    );
  }

  const totalPages = data ? Math.ceil(data.count / 10) : 0;

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" component="h2" gutterBottom>
          Historial de Puntos
        </Typography>

        <TableContainer component={Paper}>
          <Table aria-label="historial de puntos">
            <TableHead>
              <TableRow>
                <TableCell>Fecha</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Motivo</TableCell>
                <TableCell align="right">Puntos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data?.results.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.created_at), 'dd/MM/yyyy', { locale: es })}
                  </TableCell>
                  <TableCell>
                    {transactionTypeMap[transaction.transaction_type] || transaction.transaction_type}
                  </TableCell>
                  <TableCell>{transaction.reason}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={transaction.points_amount > 0 ? `+${transaction.points_amount}` : transaction.points_amount}
                      color={getChipColor(transaction.transaction_type, transaction.points_amount)}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.results.length) && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay transacciones de puntos para mostrar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default PointsHistory; 