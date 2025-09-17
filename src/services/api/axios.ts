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
      // Only clear token if it's a login/auth endpoint or if we're sure the token is invalid
      const isAuthEndpoint = error.config?.url?.includes('/auth/');
      const isLoginEndpoint = error.config?.url?.includes('/login');

      // Don't clear token immediately for non-auth endpoints to prevent race conditions
      if (isAuthEndpoint || isLoginEndpoint) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        console.warn('Unauthorized access - token cleared');
      } else {
        // For other endpoints, just log the warning but don't clear token
        console.warn('Unauthorized access - may be temporary');
      }
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
