import api from './axiosConfig';

export default {
  search: (filterOptions) => api.post('/position/search', filterOptions),
  getById: (id) => api.get(`/position/${id}`),
  create: (data) => api.post('/position', data),
  update: (id, data) => api.put(`/position/${id}`, data),
  delete: (id) => api.delete(`/position/${id}`),
  setAttributes: (id, attributeIds) => 
    api.put(`/position/${id}/attributes`, attributeIds),
  setProjectTags: (id, tagLabels) => 
    api.put(`/position/${id}/project-tags`, tagLabels),
  duplicate: (id) => api.post(`/position/${id}/duplicate`),
  getDiscussion: (id) => api.get(`/position/${id}/discussion`),
  getAttributes: (id) => api.get(`/position/${id}/attributes`),
addPost: (id, data) => api.post(`/position/${id}/discussion`, data),

};