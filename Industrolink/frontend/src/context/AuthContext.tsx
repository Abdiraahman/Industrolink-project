import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '../types/user';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: Record<string, any>) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from backend (using HTTP-only cookies)
  const fetchUser = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/profile-view/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setUser(null);
      setIsAuthenticated(false);
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  // Login method
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        await fetchUser();
      } else {
        const data = await response.json();
        setError(data.error || data.message || 'Login failed');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('Network error during login');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Register method
  const register = async (data: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (response.ok) {
        // Optionally auto-login after registration
        // await login(data.email, data.password);
        setIsAuthenticated(false);
        setUser(null);
      } else {
        const resData = await response.json();
        setError(resData.error || resData.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error during registration');
    } finally {
      setLoading(false);
    }
  };

  // Logout method
  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/logout/`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      // Ignore errors
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  // Check auth on mount
  const checkAuth = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      error,
      login,
      logout,
      register,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

