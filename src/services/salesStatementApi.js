// src/services/salesStatementApi.js
const API_BASE_URL = 'https://fraz-india-auth-1020856625182.asia-south1.run.app';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Enhanced error handling with better response parsing
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  }
  
  // Get response text first
  const responseText = await response.text();
  
  // Try to parse as JSON
  try {
    if (!responseText || responseText.trim() === '') {
      return null;
    }
    return JSON.parse(responseText);
  } catch (e) {
    console.warn('Response is not valid JSON, returning as text:', responseText);
    return { data: responseText };
  }
};

// Get common headers with authorization
const getHeaders = () => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

// Enhanced fetch wrapper with timeout and better error handling
const fetchWithAuth = async (url, options = {}, timeout = 30000) => {
  const headers = getHeaders();
  
  console.log(`Making API call to: ${url}`);
  console.log('Request payload:', options.body);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log('Response status:', response.status);
    
    const result = await handleResponse(response);
    console.log('Response data:', result);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('API call failed:', error);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout: The server took too long to respond');
    }
    
    // If it's an auth error, redirect to login
    if (error.message.includes('Authorization') || error.message.includes('token') || error.message.includes('401')) {
      console.log('Authentication error detected, redirecting to login...');
      localStorage.removeItem('authToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    throw error;
  }
};

// Report Meta APIs
export const reportMetaAPI = {
  // Get sales groups
  getSalesGroups: async (payload) => {
    console.log('Fetching sales groups with payload:', payload);
    return await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-group`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Get sales levels
  // In reportMetaAPI object:
getSalesLevels: async (payload) => {
  console.log('Fetching sales levels with payload:', payload);
  const result = await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-level`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  console.log('Raw sales levels response:', result);
  
  // Return the array directly if it's already an array
  if (Array.isArray(result)) {
    return result;
  }
  // Otherwise return the data property or empty array
  return result?.data || [];
},

  // Get sales persons - FIXED: Enhanced response handling
  getSalesPersons: async (payload) => {
    console.log('Fetching sales persons with payload:', payload);
    try {
      const result = await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-person`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('Raw sales persons response:', result);
      
      // Handle different response formats
      if (Array.isArray(result)) {
        return result;
      } else if (result && typeof result === 'object') {
        // Check for common response structures
        if (Array.isArray(result.data)) {
          return result.data;
        } else if (Array.isArray(result.result)) {
          return result.result;
        } else if (Array.isArray(result.items)) {
          return result.items;
        }
        // If it's an object but not with expected array properties, return as single item array
        return [result];
      }
      
      console.warn('Unexpected sales persons response format, returning empty array');
      return [];
    } catch (error) {
      console.error('Error in getSalesPersons:', error);
      return [];
    }
  },

  // Get divisions
  getDivisions: async (payload) => {
    console.log('Fetching divisions with payload:', payload);
    return await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-division`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Sales Statement Report APIs
export const salesStatementAPI = {
  // Get report data with longer timeout for large data
  // In salesStatementAPI object:
// In salesStatementAPI object:
getReportData: async (payload) => {
  console.log('Generating report with payload:', payload);
  const data = await fetchWithAuth(`${API_BASE_URL}/fipl/sales-statement/get-report-data`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }, 60000); // 60 second timeout for report data
  
  console.log('Raw report data response:', data);
  
  // Fix the typo in the response field name - return corrected data
  if (data) {
    const correctedData = { ...data };
    if (data.sales_statemet) {
      correctedData.sales_statement = data.sales_statemet;
      delete correctedData.sales_statemet;
    }
    return correctedData;
  }
  
  return data;
},

  // Generate Excel report
  generateExcel: async (payload) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/fipl/sales-statement/generate-excel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate Excel: ${response.statusText}`);
    }
    
    return await response.blob();
  },

  // Generate PDF report
  generatePDF: async (payload) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/fipl/sales-statement/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate PDF: ${response.statusText}`);
    }
    
    return await response.blob();
  }
};

// Utility functions for payload creation
export const payloadUtils = {
  // Create divisions payload
  createDivisionsPayload: (user) => {
    const payload = {
      loginDiv: user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "SALES_STMT"
    };
    return payload;
  },

  // Create sales groups payload
  createSalesGroupsPayload: (user, selectedDivisions) => {
    const payload = {
      loginDiv: user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "SALES_STMT",
      div: selectedDivisions.join(',')
    };
    return payload;
  },

  // Create sales levels payload
  createSalesLevelsPayload: (user) => {
    const payload = {
      reportName: "SALES_STMT",
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12'
    };
    return payload;
  },

  // Create sales persons payload - FIXED: Match working code structure
  createSalesPersonsPayload: (user, filters) => {
    const loginDiv = user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00';
    
    const payload = {
      loginDiv: loginDiv,
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "SALES_STMT",
      div: filters.division.join(','),
      hLevel: filters.level,
      salesGroup: filters.salesGroup.join(',')
    };
    
    console.log('Sales Persons Payload:', payload);
    return payload;
  },

  // Create report data payload - FIXED: Match working code structure
  createReportDataPayload: (user, filters) => {
    const loginDiv = user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00';
    
    const payload = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      salesGroup: filters.salesGroup.join(','),
      loginDiv: loginDiv,
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: filters.division.join(',')
    };
    
    // Conditionally add sales person fields based on working code logic
    if (filters.showSalesPerson || loginDiv !== '00') {
      payload.showSalespers = 'Y';
      payload.level = filters.level || '';
      payload.hcode = filters.hcode || '';
    } else {
      payload.showSalespers = '';
      payload.level = '';
      payload.hcode = '';
    }
    
    console.log('Report Data Payload:', payload);
    return payload;
  }
};

// Download utility
export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default {
  reportMetaAPI,
  salesStatementAPI,
  payloadUtils,
  downloadBlob
};