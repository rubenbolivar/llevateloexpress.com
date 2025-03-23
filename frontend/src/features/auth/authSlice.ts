import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  refreshToken: typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ access: string; refresh: string }>) => {
      const { access, refresh } = action.payload;
      state.token = access;
      state.refreshToken = refresh;
      state.isAuthenticated = true;
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', access);
        localStorage.setItem('refreshToken', refresh);
      }
    },
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      
      // Remove from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      }
    },
  },
});

export const { setCredentials, setUser, logout } = authSlice.actions;

export default authSlice.reducer; 