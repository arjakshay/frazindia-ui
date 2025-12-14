// src/pages/Reports/LocationWise/api.js
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
  
  // Check if response is empty
  if (!responseText || responseText.trim() === '') {
    console.warn('Empty response received');
    return null;
  }
  
  // Try to parse as JSON with better error handling
  try {
    // Clean response text if needed (remove any trailing commas, fix common JSON issues)
    let cleanText = responseText.trim();
    
    // Check if it looks like JSON (starts with [ or {)
    if (cleanText.startsWith('[') || cleanText.startsWith('{')) {
      // Parse the JSON
      const parsedData = JSON.parse(cleanText);
      console.log('Successfully parsed JSON response');
      return parsedData;
    } else {
      // If it's not JSON but contains JSON-like structure, try to find JSON in the response
      const jsonMatch = cleanText.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsedData = JSON.parse(jsonMatch[0]);
          console.log('Extracted and parsed JSON from response text');
          return parsedData;
        } catch (innerError) {
          console.warn('Could not parse extracted JSON, returning as text:', innerError.message);
          return { rawData: cleanText };
        }
      } else {
        console.warn('Response is not JSON, returning as text');
        return { rawData: cleanText };
      }
    }
  } catch (e) {
    console.error('JSON parsing error:', e.message);
    console.warn('Raw response text:', responseText.substring(0, 500) + '...');
    
    // If it's an array-like string but not proper JSON, try to fix it
    if (responseText.includes('[') && responseText.includes(']')) {
      try {
        // Try to fix common JSON issues
        let fixedText = responseText
          .trim()
          .replace(/,\s*\]/g, ']')  // Remove trailing commas before ]
          .replace(/,\s*\}/g, '}')  // Remove trailing commas before }
          .replace(/(\w+):/g, '"$1":')  // Add quotes to unquoted keys
          .replace(/:(\s*)([^"\d{[\s])/g, ':"$2') // Add quotes to unquoted string values
          .replace(/:\s*'([^']*)'/g, ':"$1"'); // Replace single quotes with double quotes
        
        const parsedData = JSON.parse(fixedText);
        console.log('Fixed and parsed JSON after cleanup');
        return parsedData;
      } catch (fixError) {
        console.warn('Could not fix JSON, returning raw text');
        return { rawData: responseText, error: 'Invalid JSON format' };
      }
    }
    
    return { rawData: responseText, error: e.message };
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
const fetchWithAuth = async (url, options = {}, timeout = 60000) => {
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
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const result = await handleResponse(response);
    console.log('Processed response data:', result);
    
    // Log response type and structure
    if (result) {
      console.log('Response type:', Array.isArray(result) ? 'Array' : typeof result);
      if (Array.isArray(result)) {
        console.log('Array length:', result.length);
        if (result.length > 0) {
          console.log('First item sample:', JSON.stringify(result[0]).substring(0, 200) + '...');
        }
      }
    }
    
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

// Location Wise Meta APIs
export const locationWiseMetaAPI = {
  // Get sales groups for location wise report
  getSalesGroups: async (payload) => {
    console.log('Fetching sales groups for location wise report with payload:', payload);
    const result = await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-sales-group`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log('Sales groups response:', result);
    
    // Handle different response formats
    if (result && result.data !== undefined) {
      return result.data || [];
    } else if (Array.isArray(result)) {
      return result;
    }
    return result || [];
  },

  // Get document types for location wise report
  getDocTypes: async (payload) => {
    console.log('Fetching document types for location wise report with payload:', payload);
    const result = await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-doc-type`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log('Document types response:', result);
    
    // Handle different response formats
    if (result && result.data !== undefined) {
      return result.data || [];
    } else if (Array.isArray(result)) {
      return result;
    }
    return result || [];
  },

  // Get divisions for location wise report
  getDivisions: async (payload) => {
    console.log('Fetching divisions for location wise report with payload:', payload);
    const result = await fetchWithAuth(`${API_BASE_URL}/fipl/report-meta/get-division`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    console.log('Divisions response:', result);
    
    // Handle different response formats
    if (result && result.data !== undefined) {
      return result.data || [];
    } else if (Array.isArray(result)) {
      return result;
    }
    return result || [];
  }
};

// Location Wise Report APIs
export const locationWiseAPI = {
  // Get location wise report data - FIXED: Ensure proper payload structure
  getReportData: async (filterData) => {
    console.log('Generating location wise report with filterData:', filterData);
    
    // IMPORTANT: Extract user data from filterData if it exists
    const user = filterData.user || {};
    
    // Create the correct payload structure (matching your old working payload)
    const payload = {
      dateFrom: filterData.fromDate,
      dateTo: filterData.toDate,
      salesGroup: filterData.salesGroup,
      docType: filterData.docType,
      includeSreturn: filterData.includeSreturn || 'Y', // Default to 'Y' if not specified
      loginDiv: filterData.loginDiv || user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: filterData.loginUserid || user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: filterData.loginHlevel || user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: filterData.selectedDivision ? 
           filterData.selectedDivision.split(' | ')[0] : 
           filterData.div || '01'
    };
    
    console.log('Final API payload for getReportData:', JSON.stringify(payload, null, 2));
    
    try {
      const result = await fetchWithAuth(`${API_BASE_URL}/fipl/location-wise/get-report`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }, 120000); // 120 second timeout for report data
      
      console.log('Raw location wise report data:', result);
      
      // Check if result contains rawData (indicating parsing issues)
      if (result && result.rawData) {
        console.error('Response parsing issue detected. Raw data:', result.rawData.substring(0, 500));
        throw new Error('Invalid response format from server');
      }
      
      // Ensure consistent data structure
      let finalData = { data: [] };
      
      if (result) {
        if (Array.isArray(result)) {
          // Direct array response
          finalData.data = result;
        } else if (result.data && Array.isArray(result.data)) {
          // Response with data property
          finalData = result;
        } else if (typeof result === 'object') {
          // If it's an object but not the expected structure, try to extract array
          const arrayValues = Object.values(result).find(val => Array.isArray(val));
          if (arrayValues) {
            finalData.data = arrayValues;
          } else {
            // Wrap single object in array
            finalData.data = [result];
          }
        }
      }
      
      console.log('Processed report data structure:', {
        totalItems: finalData.data?.length || 0,
        isArray: Array.isArray(finalData.data),
        sampleItem: finalData.data?.[0]
      });
      
      return finalData;
      
    } catch (error) {
      console.error('Error in getReportData:', error);
      
      // Return empty data structure on error
      return { 
        data: [],
        error: error.message,
        status: 'error'
      };
    }
  },

  // Generate Excel report
  generateExcel: async (filterData) => {
    const token = getAuthToken();
    const user = filterData.user || {};
    
    // Create payload matching the working example
    const payload = {
      dateFrom: filterData.fromDate,
      dateTo: filterData.toDate,
      salesGroup: filterData.salesGroup,
      docType: filterData.docType,
      includeSreturn: filterData.includeSreturn || 'Y',
      loginDiv: filterData.loginDiv || user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: filterData.loginUserid || user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: filterData.loginHlevel || user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: filterData.selectedDivision ? 
           filterData.selectedDivision.split(' | ')[0] : 
           filterData.div || '01'
    };
    
    console.log('Excel generation payload:', payload);
    
    const response = await fetch(`${API_BASE_URL}/fipl/location-wise/generate-excel`, {
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
  generatePDF: async (filterData) => {
    const token = getAuthToken();
    const user = filterData.user || {};
    
    // Create payload matching the working example
    const payload = {
      dateFrom: filterData.fromDate,
      dateTo: filterData.toDate,
      salesGroup: filterData.salesGroup,
      docType: filterData.docType,
      includeSreturn: filterData.includeSreturn || 'Y',
      loginDiv: filterData.loginDiv || user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: filterData.loginUserid || user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: filterData.loginHlevel || user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: filterData.selectedDivision ? 
           filterData.selectedDivision.split(' | ')[0] : 
           filterData.div || '01'
    };
    
    console.log('PDF generation payload:', payload);
    
    const response = await fetch(`${API_BASE_URL}/fipl/location-wise/generate-pdf`, {
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
export const locationWisePayloadUtils = {
  // Create divisions payload for location wise
  createDivisionsPayload: (user) => {
    const payload = {
      loginDiv: user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00',
      loginUserid: user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "LOCATION_WISE_SALES"
    };
    console.log('Location Wise Divisions Payload:', payload);
    return payload;
  },

  // Create sales groups payload for location wise
  createSalesGroupsPayload: (user, selectedDivision) => {
    const loginDiv = user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00';
    const divCode = selectedDivision ? 
                   selectedDivision.split(' | ')[0] : 
                   selectedDivision?.slice(0, 2) || '';
    
    const payload = {
      loginDiv: loginDiv,
      loginUserid: user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "LOCATION_WISE_SALES",
      div: divCode
    };
    console.log('Location Wise Sales Groups Payload:', payload);
    return payload;
  },

  // Create document types payload for location wise
  createDocTypesPayload: (user, selectedDivision) => {
    const loginDiv = user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00';
    const divCode = selectedDivision ? 
                   selectedDivision.split(' | ')[0] : 
                   selectedDivision?.slice(0, 2) || '';
    
    const payload = {
      loginDiv: loginDiv,
      loginUserid: user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      reportName: "LOCATION_WISE_SALES",
      div: divCode
    };
    console.log('Location Wise Document Types Payload:', payload);
    return payload;
  },

  // Create report data payload for location wise
  createReportDataPayload: (user, filters) => {
    const loginDiv = user?.loginDiv || user?.division?.[0]?.split(' | ')[0] || '00';
    const selectedDiv = filters.selectedDivision ? 
                       filters.selectedDivision.split(' | ')[0] : 
                       '';
    
    const payload = {
      dateFrom: filters.fromDate,
      dateTo: filters.toDate,
      salesGroup: filters.salesGroup,
      docType: filters.docType,
      includeSreturn: filters.includeSreturn || 'Y',
      loginDiv: loginDiv,
      loginUserid: user?.userId || user?.loginUserid || 'STAT0001',
      loginHlevel: user?.hierarchyLevel || user?.loginHlevel || 'H12',
      div: selectedDiv || '01'
    };
    
    console.log('Location Wise Report Data Payload:', payload);
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

// Show alert message (simple replacement for toast)
const showAlert = (message, type = 'success') => {
  if (type === 'success') {
    alert(`✅ ${message}`);
  } else if (type === 'error') {
    alert(`❌ ${message}`);
  } else if (type === 'warning') {
    alert(`⚠️ ${message}`);
  }
};

// Legacy functions for backward compatibility
export const getLocationWiseReport = async (obj) => {
  return locationWiseAPI.getReportData(obj);
};

export const getSalesGroupListData = async (obj) => {
  return locationWiseMetaAPI.getSalesGroups(obj);
};

export const getDocTypeListData = async (obj) => {
  return locationWiseMetaAPI.getDocTypes(obj);
};

export const downloadExcelFromApi = async (data, type, fileName) => {
  try {
    console.log('Downloading Excel with data:', data);
    
    // Use the enhanced API service
    const blob = await locationWiseAPI.generateExcel(data);
    
    if (blob) {
      downloadBlob(blob, fileName);
      showAlert("Excel file downloaded successfully!", 'success');
      return true;
    } else {
      showAlert("No data available for the selected filters", 'warning');
      return false;
    }
  } catch (error) {
    console.error('Error downloading Excel:', error);
    showAlert(`Failed to download Excel: ${error.message}`, 'error');
    throw error;
  }
};

// Debug utility to check response format
export const debugResponse = async (url, payload) => {
  console.log('=== DEBUG RESPONSE UTILITY ===');
  console.log('URL:', url);
  console.log('Payload:', payload);
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Raw text length:', text.length);
    console.log('First 500 chars:', text.substring(0, 500));
    console.log('Last 500 chars:', text.substring(Math.max(0, text.length - 500)));
    
    // Try to parse
    try {
      const parsed = JSON.parse(text);
      console.log('Parsed successfully:', parsed);
    } catch (e) {
      console.log('Parse error:', e.message);
    }
    
    console.log('=== END DEBUG ===');
  } catch (error) {
    console.error('Debug error:', error);
  }
};

// Combined API object
export const locationWiseServices = {
  meta: locationWiseMetaAPI,
  report: locationWiseAPI,
  payloadUtils: locationWisePayloadUtils,
  downloadBlob,
  getLocationWiseReport,
  getSalesGroupListData,
  getDocTypeListData,
  downloadExcelFromApi,
  debugResponse
};

export default locationWiseServices;