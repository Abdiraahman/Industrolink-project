import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
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
  const isFetching = useRef(false);
  const fetchUser = async () => {
    if (isFetching.current) return;
    isFetching.current = true;
    
    console.log('🔐 Fetching user profile...');
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/profile-view/`, {
        credentials: 'include',
      });
      console.log('📡 API Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ User authenticated:', data);
        // Extract user data from the nested structure
        const userData = data.user || data;
        console.log('👤 Extracted user data:', userData);
        
        // Check if this user is an admin and set admin token if needed
        if (userData.role === 'admin') {
          localStorage.setItem('adminToken', 'admin-authenticated');
          localStorage.setItem('adminUser', JSON.stringify(userData));
        }
        
        setUser(userData);
        setIsAuthenticated(true);
      } else if (response.status === 401) {
        // User is not authenticated - this is normal for new visitors
        console.log('🔒 User not authenticated (401) - redirecting to login');
        setUser(null);
        setIsAuthenticated(false);
        setError(null); // Clear any previous errors
      } else {
        // Other error occurred
        console.log('❌ API Error:', response.status, response.statusText);
        setUser(null);
        setIsAuthenticated(false);
        setError('Failed to fetch user profile');
      }
    } catch (err) {
      console.error('💥 Network Error fetching user profile:', err);
      setUser(null);
      setIsAuthenticated(false);
      setError('Network error - please check your connection');
    } finally {
      setLoading(false);
      isFetching.current = false;
      console.log('🏁 Fetch user profile completed');
    }
  };

  // Login method
  const isLoggingIn = useRef(false);
  const login = async (email: string, password: string) => {
    if (isLoggingIn.current) return;
    isLoggingIn.current = true;
    
    setLoading(true);
    setError(null);
    try {
      // First try regular user login
      let response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/users/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        await fetchUser();
        return;
      }
      
      // If regular login fails, try admin login
      response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/system-admin/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.ok) {
        const data = await response.json();
        // Store admin token and user info
        if (data.user) {
          localStorage.setItem('adminToken', 'admin-authenticated');
          localStorage.setItem('adminUser', JSON.stringify(data.user));
          // Set user in context for admin users
          setUser(data.user);
          setIsAuthenticated(true);
          setError(null);
        }
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
      isLoggingIn.current = false;
    }
  };

  // Register method
  const isRegistering = useRef(false);
  const register = async (data: Record<string, any>) => {
    if (isRegistering.current) return;
    isRegistering.current = true;
    
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
      isRegistering.current = false;
    }
  };

  // Logout method
  const isLoggingOut = useRef(false);
  const logout = async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;
    
    setLoading(true);
    setError(null);
    try {
      // Check if user is admin and logout from admin endpoint
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken === 'admin-authenticated') {
        try {
          await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/system-admin/logout/`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (err) {
          // Ignore admin logout errors
        }
        // Clear admin data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
      }
      
      // Always logout from regular user endpoint
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
      isLoggingOut.current = false;
    }
  };

  // Check auth on mount
  const checkAuth = async () => {
    await fetchUser();
  };

  // Check admin session expiration
  useEffect(() => {
    const checkAdminSession = () => {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken === 'admin-authenticated') {
        // Check if admin user exists and is valid
        const adminUser = localStorage.getItem('adminUser');
        if (!adminUser) {
          // Clear invalid admin session
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
          return;
        }
        
        try {
          const userData = JSON.parse(adminUser);
          if (!userData.user_id || !userData.email) {
            // Clear invalid admin session
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
          }
        } catch (error) {
          // Clear invalid admin session
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminUser');
        }
      }
    };

    // Check admin session every minute
    const adminSessionInterval = setInterval(checkAdminSession, 60 * 1000);
    
    // Initial check
    checkAdminSession();

    return () => clearInterval(adminSessionInterval);
  }, []);

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

