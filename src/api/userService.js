import apiClient from './apiClient';

/**
 * User Service
 */
const userService = {
  getAll: () => apiClient.get('/users/'),

  getById: (id) => apiClient.get(`/users/${id}/`),

  // Current authenticated member's profile
  getMe: () => apiClient.get('/auth/me/'),
  patchMe: (formData) => apiClient.patch('/auth/me/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  create: (userData) => apiClient.post('/users/', userData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  update: (id, userData) => apiClient.put(`/users/${id}/`, userData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  patch: (id, userData) => apiClient.patch(`/users/${id}/`, userData, { headers: { 'Content-Type': 'multipart/form-data' } }),

  delete: (id) => apiClient.delete(`/users/${id}/`)
};

export default userService;
