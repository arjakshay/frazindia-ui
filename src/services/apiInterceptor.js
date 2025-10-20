// src/services/apiInterceptor.js
import { authAPI } from './api';

// Global API response interceptor
export const setupApiInterceptor = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch.apply(this, args);
      
      // Clone response to read it without consuming the stream
      const clonedResponse = response.clone();
      
      // Check for session expiry in response
      if (!response.ok) {
        const errorData = await clonedResponse.json().catch(() => null);
        
        // Check for session expired errors
        if (response.status === 401 || 
            response.status === 403 ||
            (errorData && (
              errorData.message?.toLowerCase().includes('session') && 
              errorData.message?.toLowerCase().includes('expired')
            )) ||
            (errorData && errorData.error === 'Session expired')) {
          
          console.log('API interceptor detected session expiry');
          
          // Trigger session expiry globally
          localStorage.setItem('apiSessionExpired', 'true');
          
          // Dispatch custom event
          window.dispatchEvent(new CustomEvent('apiSessionExpired'));
          
          // Call global function if exists
          if (typeof window.triggerSessionExpiry === 'function') {
            window.triggerSessionExpiry();
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('Fetch interceptor error:', error);
      throw error;
    }
  };
};

// Axios interceptor (if using axios)
export const setupAxiosInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response) {
        const { status, data } = error.response;
        
        // Check for session expiry
        if (status === 401 || 
            status === 403 ||
            (data && (
              data.message?.toLowerCase().includes('session') && 
              data.message?.toLowerCase().includes('expired')
            )) ||
            (data && data.error === 'Session expired')) {
          
          console.log('Axios interceptor detected session expiry');
          
          // Trigger session expiry globally
          localStorage.setItem('apiSessionExpired', 'true');
          window.dispatchEvent(new CustomEvent('apiSessionExpired'));
          
          if (typeof window.triggerSessionExpiry === 'function') {
            window.triggerSessionExpiry();
          }
        }
      }
      return Promise.reject(error);
    }
  );
};