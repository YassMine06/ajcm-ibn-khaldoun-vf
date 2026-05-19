import apiClient from './apiClient';

/**
 * Registration Service
 */
const registrationService = {
  getAll: () => apiClient.get('/registrations/'),
  getByEvent: (eventName) => apiClient.get(`/registrations/?event=${encodeURIComponent(eventName)}`),
  create: (data) => apiClient.post('/registrations/', data),
  delete: (id) => apiClient.delete(`/registrations/${id}/`),
};

export default registrationService;
