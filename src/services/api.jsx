import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Mock API functions for demo
export const authAPI = {
  login: async (credentials) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      token: 'demo-jwt-token', 
      user: { id: 1, name: 'Demo User', email: credentials.username } 
    };
  }
};

export default api;
