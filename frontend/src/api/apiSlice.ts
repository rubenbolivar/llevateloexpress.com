import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/lib/store';

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  prepareHeaders: (headers, { getState }) => {
    // Add auth token to headers if available
    const token = localStorage.getItem('token');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
  credentials: 'include', // This allows the API to set cookies
});

// Custom baseQuery with token refresh logic
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);
  
  // If we get a 401 Unauthorized response, try to refresh the token
  if (result.error && result.error.status === 401) {
    // Try to get a new token
    const refreshResult = await baseQuery(
      { url: '/auth/token/refresh/', method: 'POST' },
      api,
      extraOptions
    );
    
    if (refreshResult.data) {
      // Store the new token
      const { access } = refreshResult.data as { access: string };
      localStorage.setItem('token', access);
      
      // Retry the original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // If refresh fails, log out
      localStorage.removeItem('token');
    }
  }
  
  return result;
};

// Define our single API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Products', 
    'FinancingPlans', 
    'Applications', 
    'Payments',
    'DashboardStats',
    'SalesStats',
    'ProductStats',
    'UserStats',
    'ApplicationStats',
    'PaymentStats',
    'PointsBalance',
    'PointsTransactions',
  ],
  endpoints: (builder) => ({}),
});

// Export hooks for usage in functional components
export const {
  useLoginMutation,
  useRegisterMutation,
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
} = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: 'token/',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: 'accounts/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    getUserProfile: builder.query({
      query: () => 'accounts/profile/',
      providesTags: ['User'],
    }),
    updateUserProfile: builder.mutation({
      query: (userData) => ({
        url: 'accounts/profile/',
        method: 'PATCH',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
  }),
}); 