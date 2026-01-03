import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/api';

const decodeJwt = (token) => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (e) {
    return null;
  }
};

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const normalizeRole = (role) => (role || '').toUpperCase();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken) {
      const payload = decodeJwt(storedToken);
      const nowSec = Math.floor(Date.now() / 1000);

      // If token invalid or expired, clear it
      if (!payload || (payload.exp && payload.exp < nowSec)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        return;
      }

      setToken(storedToken);
      setIsAuthenticated(true);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.warn('Failed to parse stored user');
        }
      } else if (payload?.role) {
        const fallbackUser = {
          id: payload.id,
          employeeId: payload.employeeId,
          role: payload.role,
        };
        setUser(fallbackUser);
        localStorage.setItem('user', JSON.stringify(fallbackUser));
      }
    }
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const hasRole = (roles = []) => {
    if (!roles.length) return true;
    const userRole = normalizeRole(user?.role);
    const target = roles.map(normalizeRole);
    return target.includes(userRole);
  };

  const isAdmin = () => normalizeRole(user?.role) === 'ADMIN';
  const isHR = () => normalizeRole(user?.role) === 'HR';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loginUser,
      logout,
      isAdmin,
      isHR,
      hasRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};