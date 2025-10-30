import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me')
};

export const claimsAPI = {
  getAll: (params) => api.get('/claims', { params }),
  getById: (id) => api.get(`/claims/${id}`),
  create: (formData) => api.post('/claims', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateStatus: (id, data) => api.patch(`/claims/${id}/status`, data),
  addNote: (id, data) => api.post(`/claims/${id}/notes`, data),
  getAudit: (id) => api.get(`/claims/${id}/audit`),
  getStats: () => api.get('/claims/stats/summary')
};

export const policiesAPI = {
  getAll: () => api.get('/policies'),
  getByNumber: (policyNumber) => api.get(`/policies/${policyNumber}`)
};

export const documentsAPI = {
  upload: (claimId, formData) => api.post(`/documents/${claimId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getForClaim: (claimId) => api.get(`/documents/${claimId}`)
};

export default api;
