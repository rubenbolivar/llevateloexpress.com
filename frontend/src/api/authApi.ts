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
    updateProfile: builder.mutation<User, Partial<User>>({
      query: (userData) => ({
        url: '/auth/profile/',
        method: 'PATCH',
        body: userData,
      }),
    }),
    updateClientProfile: builder.mutation<any, any>({
      query: (profileData) => ({
        url: '/auth/client-profile/',
        method: 'PATCH',
        body: profileData,
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
  useUpdateProfileMutation,
  useUpdateClientProfileMutation,
} = authApiSlice;

// Utility functions for direct use in components
export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }
  
  return await response.json();
};

export const register = async (userData: RegistrationData) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Registration failed');
  }
  
  return await response.json();
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me/`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (!response.ok) {
    return null;
  }
  
  return await response.json();
};

export const updateProfile = async (userData: Partial<User>) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    throw new Error('Update failed');
  }
  
  return await response.json();
};

export const updateClientProfile = async (profileData: any) => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/client-profile/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });
  
  if (!response.ok) {
    throw new Error('Update failed');
  }
  
  return await response.json();
}; 