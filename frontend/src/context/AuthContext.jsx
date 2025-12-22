import React, { createContext, useState, useContext, useEffect } from 'react';
import { getCurrentUser, isAuthenticated as checkAuth, logout as authLogout } from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (checkAuth()) {
        const userData = getCurrentUser();
        setUser(userData);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const isJobSeeker = () => {
    return user?.role === 'JOB_SEEKER';
  };

  const isRecruiter = () => {
    return user?.role === 'RECRUITER';
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isJobSeeker,
    isRecruiter,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
