// src/services/salesStatementApi.js
const API_BASE_URL = 'https://fraz-india-auth-1020856625182.asia-south1.run.app';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken') || localStorage.getItem('token');
};

// Enhanced error handling with timeout
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
  
  return response.json();
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
    
    return await handleResponse(response);
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
  getSalesLevels: async (payload) => {
    console.log('Fetching sales levels with payload:', payload);
    return await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-level`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  // Get sales persons
  getSalesPersons: async (payload) => {
    console.log('Fetching sales persons with payload:', payload);
    return await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-person`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Sales Statement Report APIs
export const salesStatementAPI = {
  // Get report data with longer timeout for large data
  getReportData: async (payload) => {
    console.log('Generating report with payload:', payload);
    const data = await fetchWithAuth(`${API_BASE_URL}/fipl/sales-statement/get-report-data`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }, 60000); // 60 second timeout for report data
    
    // Fix the typo in the response field name
    if (data && data.sales_statemet) {
      data.sales_statement = data.sales_statemet;
      delete data.sales_statemet;
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

  // Create sales persons payload
  createSalesPersonsPayload: (user, filters) => {
    const payload = {
      loginDiv: user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "SALES_STMT",
      div: filters.division.join(','),
      hLevel: filters.level,
      salesGroup: filters.salesGroup.join(',')
    };
    return payload;
  },

  // Create report data payload
  createReportDataPayload: (user, filters) => {
    const payload = {
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      salesGroup: filters.salesGroup.join(','),
      loginDiv: user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: user?.userId || user?.loginUserid,
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: filters.division.join(','),
      showSalespers: filters.showSalesPerson ? 'Y' : '',
      level: filters.level || '',
      hcode: filters.hcode || ''
    };
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