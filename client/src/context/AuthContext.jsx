import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('gurjeet_token') || null);
  const [loading, setLoading] = useState(true);

  // Restore current user session from token
  const fetchCurrentUser = useCallback(async () => {
    const savedToken = localStorage.getItem('gurjeet_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      if (res?.data) {
        setUser(res.data);
        setToken(savedToken);
      }
    } catch (err) {
      console.warn('Session restoration failed:', err.message);
      localStorage.removeItem('gurjeet_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();

    // Listen for automatic token expiration from API interceptor
    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('gurjeet_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('gurjeet_auth_expired', handleAuthExpired);
  }, [fetchCurrentUser]);

  // Login handler
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res?.data?.token) {
      localStorage.setItem('gurjeet_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error('Invalid login response from server');
  };

  // Register handler
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res?.data?.token) {
      localStorage.setItem('gurjeet_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    }
    throw new Error('Registration failed');
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('gurjeet_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        refreshUser: fetchCurrentUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
