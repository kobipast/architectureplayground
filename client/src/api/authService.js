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

  // Logout user
  logout: async () => {
    try {
      await axiosClient.post('/auth/logout'); // Best-effort server-side logout
    } catch (e) {
      // Ignore server errors; still clear local auth state
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  },
  

  logout: async () => {
    try {
      await axiosClient.post('/auth/logout'); // Best-effort server-side logout (clears refresh token cookie/state)
    } catch (e) {
      // Ignore server errors; still clear local auth state
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:logout'));
    }
  },

  // Get current user info (if backend provides this endpoint)
  getCurrentUser: () => {
    return axiosClient.get('/users/me');
  },

  // Refresh token (if backend supports refresh tokens)
  refreshToken: (refreshToken) => {
    return axiosClient.post('/auth/refresh', { refreshToken });
  },
};

export default authService;





