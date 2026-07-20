import api from './axiosConfig';

export default {
  search: (filterOptions) => api.post('/project/search', filterOptions),
  getById: (id) => api.get(`/project/${id}`),
  create: (data) => api.post('/project', data),
  update: (id, data) => api.put(`/project/${id}`, data),
  delete: (id) => api.delete(`/project/${id}`),
  setTags: (id, tagLabels) => api.put(`/project/${id}`, tagLabels),
};