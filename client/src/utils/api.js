import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('expialert_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  add: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export const alertAPI = {
  getAll: () => api.get('/alerts'),
  getUnreadCount: () => api.get('/alerts/unread-count'),
  markRead: (id) => api.put(`/alerts/${id}/read`),
  markAllRead: () => api.put('/alerts/mark-all-read'),
  delete: (id) => api.delete(`/alerts/${id}`),
};

export const dashboardAPI = {
  get: () => api.get('/dashboard'),
};

export const authAPI = {
  updateSettings: (data) => api.put('/auth/settings', data),
};

export default api;
