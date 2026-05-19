import apiClient from './apiClient';

/**
 * Authentication Service
 */
const authService = {
  login: (username, password) => {
    return apiClient.post('/login', { username, password });
  },

  logout: () => {
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
