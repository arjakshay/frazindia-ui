// services/api.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials).then(res => res.data),
  getCurrentUser: () => api.get('/auth/me').then(res => res.data),
  logout: () => api.post('/auth/logout'),
};

// Reports API
export const reportsAPI = {
  getAll: (filters = {}) => api.get('/reports', { params: filters }).then(res => res.data),
  getById: (id) => api.get(`/reports/${id}`).then(res => res.data),
  generate: (reportConfig) => api.post('/reports/generate', reportConfig).then(res => res.data),
  download: (id) => api.get(`/reports/${id}/download`, { responseType: 'blob' }),
  delete: (id) => api.delete(`/reports/${id}`),
  getTypes: () => api.get('/reports/types').then(res => res.data),
};

// Analytics API
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard').then(res => res.data),
  getReportMetrics: () => api.get('/analytics/metrics').then(res => res.data),
};

export default api;