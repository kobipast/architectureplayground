import axiosClient from './axiosClient';

const authService = {
  // Register new user
  register: (userData) => {
    return axiosClient.post('/auth/register', userData);
  },

  // Login user
  login: (credentials) => {
    return axiosClient.post('/auth/login', credentials);
  },

  // Logout user (client-side only, server may have endpoint for token invalidation)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user info (if backend provides this endpoint)
  getCurrentUser: () => {
    return axiosClient.get('/auth/me');
  },

  // Refresh token (if backend supports refresh tokens)
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },
};

export default authService;





