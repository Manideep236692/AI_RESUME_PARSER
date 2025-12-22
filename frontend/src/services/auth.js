import axios from 'axios';
import { storage } from './storage';
import { API_BASE_URL } from '../utils/constants';

const authAPI = axios.create({
  baseURL: API_BASE_URL + '/auth',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const register = async (userData) => {
  const response = await authAPI.post('/register', userData);
  if (response.data.token) {
    storage.setToken(response.data.token);
    storage.setUser({
      userId: response.data.userId,
      email: response.data.email,
      role: response.data.role
    });
  }
  return response.data;
};

export const login = async (credentials) => {
  const response = await authAPI.post('/login', credentials);
  if (response.data.token) {
    storage.setToken(response.data.token);
    storage.setUser({
      userId: response.data.userId,
      email: response.data.email,
      role: response.data.role
    });
  }
  return response.data;
};

export const logout = () => {
  storage.clear();
};

export const getCurrentUser = () => {
  return storage.getUser();
};

export const isAuthenticated = () => {
  return !!storage.getToken();
};
