import api from './axiosConfig';

export default {
  search: (filterOptions) => api.post('/cv/search', filterOptions),
  getById: (id) => api.get(`/cv/${id}`),
  create: (data) => api.post('/cv', data),
  update: (id, data) => api.put(`/cv/${id}`, data),
  delete: (id) => api.delete(`/cv/${id}`),
  publish: (id) => api.post(`/cv/${id}/publish`),
  getAttributes: (id) => api.get(`/cv/${id}/attributes`),
  like: (id) => api.post(`/cv/${id}/like`),
  unlike: (id) => api.delete(`/cv/${id}/like`),
};