import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'https://berestaurantappformentee-production.up.railway.app', // Use consistent API URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available (check both localStorage and sessionStorage)
    const token =
      localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Handle unauthorized - only clear token, don't redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      // Don't redirect automatically to prevent infinite loops
      console.warn('Unauthorized access - token cleared');
    } else if (
      error.code === 'ERR_NETWORK' ||
      error.message?.includes('CORS')
    ) {
      // Handle CORS and network errors
      console.error('CORS or Network Error:', error.message);
      throw new Error(
        'Unable to connect to server. Please check your internet connection.'
      );
    }
    return Promise.reject(error);
  }
);
