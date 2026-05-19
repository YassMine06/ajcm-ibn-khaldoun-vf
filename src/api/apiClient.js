import axios from 'axios';

/**
 * Centralized API Client
 * Automatically attaches the correct auth token (admin or member) from localStorage.
 * Handles 401 errors globally by clearing credentials and redirecting to login.
 *
 * ── Shared URL constants ──────────────────────────────────────────────
 * Import these in any file that needs to build an absolute URL:
 *   import apiClient, { API_BASE, MEDIA_BASE } from '../../api/apiClient';
 */

/** Base URL for the Django REST API  → e.g.  http://localhost:8000/api/ */
export const API_BASE   = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/').replace(/\/$/, '');

/** Base URL for Django media files   → e.g.  http://localhost:8000 */
export const MEDIA_BASE = API_BASE.replace(/\/api.*$/, '');

/** Resolve a relative media path to a full URL */
export const mediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${MEDIA_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
};

const apiClient = axios.create({
  baseURL: API_BASE + '/',
  headers: { 'Content-Type': 'application/json' },
});


// Request Interceptor — attach admin or member token based on URL context
apiClient.interceptors.request.use(
  (config) => {
    const isMemberRoute = window.location.pathname.startsWith('/membre');
    // On member routes → always use member token; on admin routes → use admin token
    const token = isMemberRoute
      ? localStorage.getItem('access')
      : (localStorage.getItem('adminToken') || localStorage.getItem('access'));
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor — handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response.data, // Return data directly
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      error.message ||
      'Une erreur inattendue est survenue.';

    console.error('[API Error]:', message);

    if (error.response?.status === 401) {
      // Determine which session to clear based on current URL
      const isAdmin = window.location.pathname.startsWith('/admin');
      if (isAdmin) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
      } else {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
        window.location.href = '/membre/login';
      }
    }

    return Promise.reject({ ...error, message });
  }
);

export default apiClient;
