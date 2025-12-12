import axiosClient from './axiosClient';

const userService = {
  // Get all users
  getAllUsers: () => {
    return axiosClient.get('/users');
  },

  // Get user by ID
  getUserById: (id) => {
    return axiosClient.get(`/users/${id}`);
  },

  // Create new user
  createUser: (userData) => {
    return axiosClient.post('/users', userData);
  },

  // Update user
  updateUser: (id, userData) => {
    return axiosClient.put(`/users/${id}`, userData);
  },

  // Delete user
  deleteUser: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
};

export default userService;


