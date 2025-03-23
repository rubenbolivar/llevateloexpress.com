import { apiSlice } from './apiSlice';

// Tipos para el sistema de puntos
export interface PointsSummary {
  id: number;
  user: number;
  current_points: number;
  lifetime_points: number;
  last_updated: string;
}

export interface PointTransaction {
  id: number;
  user: number;
  transaction_type: string;
  points_amount: number;
  payment?: number;
  reason: string;
  created_by?: number;
  created_at: string;
}

export interface WaitingDaysInfo {
  current_points: number;
  waiting_days: number;
  status: string;
  thresholds: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
  };
  waiting_days_by_threshold: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    bad: number;
  };
}

export const pointsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Obtiene el balance actual de puntos del usuario
    getPointsBalance: builder.query<PointsSummary, void>({
      query: () => ({
        url: '/points/balance/',
        method: 'GET',
      }),
      providesTags: ['PointsBalance'],
    }),

    // Obtiene el historial de transacciones de puntos
    getPointTransactions: builder.query<{ results: PointTransaction[], count: number }, { page?: number, pageSize?: number }>({
      query: ({ page = 1, pageSize = 10 }) => ({
        url: `/points/transactions/?page=${page}&page_size=${pageSize}`,
        method: 'GET',
      }),
      providesTags: ['PointsTransactions'],
    }),

    // Obtiene información sobre días de espera
    getWaitingDays: builder.query<WaitingDaysInfo, void>({
      query: () => ({
        url: '/points/delay/',
        method: 'GET',
      }),
      providesTags: ['PointsBalance'],
    }),
  }),
});

export const {
  useGetPointsBalanceQuery,
  useGetPointTransactionsQuery,
  useGetWaitingDaysQuery,
} = pointsApiSlice; 