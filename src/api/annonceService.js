import apiClient from './apiClient';

/**
 * Annonce Service
 */
const annonceService = {
  getAll: () => apiClient.get('/announcements/'),
  
  create: (data) => apiClient.post('/announcements/', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  update: (id, data) => apiClient.put(`/announcements/${id}/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  
  delete: (id) => apiClient.delete(`/announcements/${id}/`),
};

export default annonceService;
