import api from './axiosConfig';

export default {
  search: (filterOptions) => api.post('/attribute/search', filterOptions),
  getById: (id) => api.get(`/attribute/${id}`),
  create: (data) => api.post('/attribute', data),
  update: (id, data) => api.put(`/attribute/${id}`, data),
  delete: (id) => api.delete(`/attribute/${id}`),
  searchByPrefix: (prefix, limit = 10) => 
    api.get('/attribute/searchByPrefix', { params: { prefix, limit } }),
};