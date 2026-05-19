import apiClient from './apiClient';

/**
 * Event Service
 * Handles all API calls related to activities and events.
 */
const eventService = {
  getAll: () => apiClient.get('/events/'),
  getById: (id) => apiClient.get(`/events/${encodeURIComponent(id)}/`),
  create: (eventData) => apiClient.post('/events/', eventData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, eventData) => apiClient.put(`/events/${encodeURIComponent(id)}/`, eventData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => apiClient.delete(`/events/${encodeURIComponent(id)}/`),
};

export default eventService;
