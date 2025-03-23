'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { esES } from '@mui/material/locale';
import { Provider } from 'react-redux';
import { store } from '@/lib/store';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0284c7', // primary-600
      light: '#38bdf8', // primary-400
      dark: '#0369a1', // primary-700
    },
    secondary: {
      main: '#475569', // secondary-600
      light: '#94a3b8', // secondary-400
      dark: '#334155', // secondary-700
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    info: {
      main: '#3b82f6',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'var(--font-inter)',
    h1: {
      fontFamily: 'var(--font-poppins)',
    },
    h2: {
      fontFamily: 'var(--font-poppins)',
    },
    h3: {
      fontFamily: 'var(--font-poppins)',
    },
    h4: {
      fontFamily: 'var(--font-poppins)',
    },
    h5: {
      fontFamily: 'var(--font-poppins)',
    },
    h6: {
      fontFamily: 'var(--font-poppins)',
    },
  },
  shape: {
    borderRadius: 8,
  },
}, esES);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </Provider>
  );
} 