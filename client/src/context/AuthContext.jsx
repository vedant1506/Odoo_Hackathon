import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin } from '../api/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Optionally, verify token with backend
      setToken(storedToken);
      setIsAuthenticated(true);
      // You might want to decode token to get user info, or fetch user data
    }
  }, []);

  const loginUser = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const isAdmin = () => {
    return user && (user.role === 'Admin' || user.role === 'HR');
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loginUser,
      logout,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};