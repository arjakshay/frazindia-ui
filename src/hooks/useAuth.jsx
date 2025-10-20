// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'authToken' || e.key === 'user' || e.key === 'forceLogout') {
        if (e.key === 'forceLogout' && e.newValue === 'true') {
          clearAuthData();
          window.location.href = '/login';
          return;
        }
        checkAuth();
      }
    };

    const handleForceLogout = () => {
      clearAuthData();
      window.location.href = '/login';
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('forceLogout', handleForceLogout);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('forceLogout', handleForceLogout);
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('user');
      const forceLogout = localStorage.getItem('forceLogout');
      
      if (forceLogout === 'true') {
        clearAuthData();
        return;
      }
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser && parsedUser.userId && parsedUser.token) {
          // Don't verify token on initial load to avoid unnecessary API calls
          // The API interceptor will handle token validation for actual API calls
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          clearAuthData();
        }
      } else {
        clearAuthData();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      clearAuthData();
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    localStorage.removeItem('currentSessionId');
    setUser(null);
    setIsAuthenticated(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);
      
      if (response.token) {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Set force logout for other devices
        localStorage.setItem('forceLogout', 'true');
        
        setTimeout(() => {
          localStorage.setItem('sessionId', sessionId);
          localStorage.setItem('currentSessionId', sessionId);
          localStorage.removeItem('forceLogout');
        }, 100);

        const userData = {
          ...response,
          userId: response.userId || credentials.userId,
          name: response.name || credentials.userId,
          designation: response.designation || 'User',
          token: response.token,
          sessionId: sessionId
        };
        
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return userData;
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      // Clear auth data on login failure
      clearAuthData();
      
      // Re-throw the error so the login component can handle it
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      const currentSessionId = localStorage.getItem('currentSessionId');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('currentSessionId');
      
      if (currentSessionId) {
        await authAPI.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthData();
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}