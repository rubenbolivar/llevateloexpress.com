import { apiSlice } from './apiSlice';

interface LoginCredentials {
  email: string;
  password: string;
}

interface TokenResponse {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
}

interface RegistrationData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export const authApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginCredentials>({
      query: (credentials) => ({
        url: '/auth/login/',
        method: 'POST',
        body: credentials,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout/',
        method: 'POST',
      }),
    }),
    getUser: builder.query<User, void>({
      query: () => '/auth/me/',
    }),
    register: builder.mutation<User, RegistrationData>({
      query: (userData) => ({
        url: '/auth/register/',
        method: 'POST',
        body: userData,
      }),
    }),
    refreshToken: builder.mutation<TokenResponse, void>({
      query: () => ({
        url: '/auth/token/refresh/',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useLazyGetUserQuery,
  useGetUserQuery,
  useRegisterMutation,
  useRefreshTokenMutation,
} = authApiSlice; 