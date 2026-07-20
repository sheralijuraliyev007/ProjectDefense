import api from './axiosConfig';

export default {
  search: (filterOptions) => api.post('/admin/users/search', filterOptions),
  getById: (userId) => api.get(`/admin/users/${userId}`),
  block: (userIds) => api.put('/admin/users/block', userIds),
  unblock: (userIds) => api.put('/admin/users/unblock', userIds),
  delete: (userIds) => api.delete('/admin/users', { data: userIds }),
  assignRole: (userIds, roleCode) => api.put(`/admin/users/roles/${roleCode}/assign`, userIds),
  removeRole: (userIds, roleCode) => api.put(`/admin/users/roles/${roleCode}/remove`, userIds),
};