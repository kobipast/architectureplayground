import axios from 'axios';

// Create axios instance with default configuration
const axiosClient = axios.create({
  baseURL: '/api', // Will be proxied to backend by Vite
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Add JWT token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Generate and add X-Correlation-Id header if not already present
    if (!config.headers['X-Correlation-Id']) {
      config.headers['X-Correlation-Id'] = crypto.randomUUID();
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:{
          // Unauthorized - handle logout
          console.error('Unauthorized access');
          // if the refresh itself is unauthorized, logout
          if (originalRequest?.url?.includes('/auth/refresh')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(error);
          }
          // avoid endless retry
          if (originalRequest?._retry) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(error);
          }
          originalRequest._retry = true;

          try {
            const refreshRes = await axiosClient.post('/auth/refresh');
            const newToken = refreshRes.data.token; 
            localStorage.setItem('token', newToken);

            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            return axiosClient(originalRequest);
          } catch (refreshErr) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth:logout'));
            return Promise.reject(refreshErr);
          }

        }

        case 403:
          // Forbidden
          console.error('Forbidden access');
          break;
        case 404:
          // Not found
          console.error('Resource not found');
          break;
        case 500:
          // Server error
          console.error('Server error');
          break;
        default:
          console.error('Request failed:', error.response.status);
      }
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
    } else {
      // Error in request setup
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;


