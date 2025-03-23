import { useState, useEffect, createContext, useContext } from 'react';
import { useLazyGetUserQuery, useLoginMutation, useLogoutMutation } from '@/api/authApi';

interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff: boolean;
  is_active: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: any;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: async () => {},
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const useProvideAuth = (): AuthContextType => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();
  const [logoutMutation] = useLogoutMutation();
  const [getUserQuery] = useLazyGetUserQuery();

  // Comprobar si el usuario está autenticado al cargar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await getUserQuery().unwrap();
      setUser(result);
      setIsAuthenticated(true);
      setError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      await loginMutation({ email, password }).unwrap();
      await checkAuth();
    } catch (error) {
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await logoutMutation().unwrap();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || isLoginLoading,
    error,
    login,
    logout,
    checkAuth,
  };
}; 