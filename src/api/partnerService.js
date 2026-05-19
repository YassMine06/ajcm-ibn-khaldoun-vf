import apiClient from './apiClient';

/**
 * Partner Service
 */
const partnerService = {
  getAll: () => apiClient.get('/partners/'),
  create: (data) => apiClient.post('/partners/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => apiClient.put(`/partners/${id}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => apiClient.delete(`/partners/${id}/`),
};

export default partnerService;
