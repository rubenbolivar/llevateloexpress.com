import { apiSlice } from './apiSlice';

// Interfaces
export interface Payment {
  id: number;
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  application: {
    id: number;
    reference_number: string;
  };
  payment_method: {
    id: number;
    name: string;
  };
  payment_type: string;
  amount: number;
  expected_amount: number;
  reference_number: string;
  payment_date: string;
  due_date: string | null;
  receipt: string;
  payer_name: string;
  status: string;
  is_verified: boolean;
  verified_by: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  } | null;
  verification_date: string | null;
  rejection_reason: string;
  notes: string;
  points_processed: boolean;
  created_at: string;
}

export interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  instructions: string;
  account_info: string;
  is_active: boolean;
}

export interface PaymentFilters {
  status?: string;
  page?: number;
  page_size?: number;
  search?: string;
  application?: number;
  user?: number;
}

// Payment API slice
export const paymentsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get paginated list of payments with filters
    getPayments: builder.query<{ count: number; results: Payment[] }, PaymentFilters>({
      query: (filters = {}) => {
        // Build query params
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', String(filters.page));
        if (filters.page_size) params.append('page_size', String(filters.page_size));
        if (filters.search) params.append('search', filters.search);
        if (filters.application) params.append('application', String(filters.application));
        if (filters.user) params.append('user', String(filters.user));
        
        return {
          url: `/payments/?${params.toString()}`,
          method: 'GET',
        };
      },
      providesTags: ['Payments'],
    }),
    
    // Get a single payment by ID
    getPayment: builder.query<Payment, number>({
      query: (id) => ({
        url: `/payments/${id}/`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Payments', id }],
    }),
    
    // Create a new payment
    createPayment: builder.mutation<Payment, FormData>({
      query: (paymentData) => ({
        url: '/payments/',
        method: 'POST',
        body: paymentData,
        formData: true,
      }),
      invalidatesTags: ['Payments'],
    }),
    
    // Verify a payment
    verifyPayment: builder.mutation<Payment, { id: number, notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/payments/${id}/verify/`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payments', id },
        'Payments',
        'DashboardStats',
        'PaymentStats'
      ],
    }),
    
    // Reject a payment
    rejectPayment: builder.mutation<Payment, { id: number, notes: string }>({
      query: ({ id, notes }) => ({
        url: `/payments/${id}/reject/`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Payments', id }, 
        'Payments',
        'DashboardStats',
        'PaymentStats'
      ],
    }),
    
    // Get payment methods
    getPaymentMethods: builder.query<PaymentMethod[], void>({
      query: () => ({
        url: '/payment-methods/active/',
        method: 'GET',
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetPaymentsQuery,
  useGetPaymentQuery,
  useCreatePaymentMutation,
  useVerifyPaymentMutation,
  useRejectPaymentMutation,
  useGetPaymentMethodsQuery,
} = paymentsApiSlice;

// Helper functions for direct API calls
export const fetchPayments = async (filters: PaymentFilters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.page) queryParams.append('page', String(filters.page));
  if (filters.page_size) queryParams.append('page_size', String(filters.page_size));
  if (filters.search) queryParams.append('search', filters.search);
  if (filters.application) queryParams.append('application', String(filters.application));
  if (filters.user) queryParams.append('user', String(filters.user));
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/payments/?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch payments');
  }
  
  return response.json();
};

export const verifyPayment = async (id: number, data: { notes?: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/payments/${id}/verify/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to verify payment');
  }
  
  return response.json();
};

export const rejectPayment = async (id: number, data: { notes: string }) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/payments/${id}/reject/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to reject payment');
  }
  
  return response.json();
}; 