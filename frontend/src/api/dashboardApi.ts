import { apiSlice } from './apiSlice';

// Interfaces para las estadísticas del dashboard
export interface DashboardStats {
  users: {
    total: number;
    new_month: number;
  };
  products: {
    total: number;
    active: number;
  };
  applications: {
    total: number;
    pending: number;
    approved: number;
  };
  payments: {
    total: number;
    pending: number;
    verified: number;
    total_amount: number;
  };
}

export interface SalesData {
  date: string;
  count: number;
  amount: number;
}

export interface ProductStats {
  top_products: {
    id: number;
    name: string;
    price: number;
    applications_count: number;
  }[];
  top_categories: {
    id: number;
    name: string;
    products_count: number;
    applications_count: number;
  }[];
}

export interface UserStats {
  top_applicants: {
    id: number;
    username: string;
    email: string;
    applications_count: number;
  }[];
  top_payers: {
    id: number;
    username: string;
    email: string;
    payments_count: number;
    payments_amount: number;
  }[];
  points_distribution: {
    excellent: number;
    good: number;
    average: number;
    poor: number;
    bad: number;
  };
}

export interface ApplicationStats {
  status_distribution: {
    [key: string]: number;
  };
  plan_distribution: {
    plan_type: string;
    plan_name: string;
    count: number;
  }[];
  avg_approval_time: number;
}

export interface PaymentStats {
  status_distribution: {
    [key: string]: {
      count: number;
      amount: number;
    };
  };
  payments_by_month: {
    year: number;
    month: number;
    date: string;
    count: number;
    amount: number;
  }[];
  payment_timeliness: {
    on_time: number;
    late: number;
    on_time_percentage: number;
  };
}

export const dashboardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Estadísticas generales del dashboard
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: '/dashboard/stats/overview/',
        method: 'GET',
      }),
      providesTags: ['DashboardStats'],
    }),

    // Estadísticas de ventas
    getSalesStats: builder.query<SalesData[], string>({
      query: (period) => ({
        url: `/dashboard/stats/sales/?period=${period}`,
        method: 'GET',
      }),
      providesTags: ['SalesStats'],
    }),

    // Estadísticas de productos
    getProductStats: builder.query<ProductStats, void>({
      query: () => ({
        url: '/dashboard/stats/products/',
        method: 'GET',
      }),
      providesTags: ['ProductStats'],
    }),

    // Estadísticas de usuarios
    getUserStats: builder.query<UserStats, void>({
      query: () => ({
        url: '/dashboard/stats/users/',
        method: 'GET',
      }),
      providesTags: ['UserStats'],
    }),

    // Estadísticas de solicitudes
    getApplicationStats: builder.query<ApplicationStats, void>({
      query: () => ({
        url: '/dashboard/stats/applications/',
        method: 'GET',
      }),
      providesTags: ['ApplicationStats'],
    }),

    // Estadísticas de pagos
    getPaymentStats: builder.query<PaymentStats, string>({
      query: (period) => ({
        url: `/dashboard/stats/payments/?period=${period}`,
        method: 'GET',
      }),
      providesTags: ['PaymentStats'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetSalesStatsQuery,
  useGetProductStatsQuery,
  useGetUserStatsQuery,
  useGetApplicationStatsQuery,
  useGetPaymentStatsQuery,
} = dashboardApiSlice; 