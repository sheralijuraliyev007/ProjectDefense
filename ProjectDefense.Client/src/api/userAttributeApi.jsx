import api from './axiosConfig';

export default {
  getMine: (targetUserId) => api.get('/UserAttribute', { params: targetUserId ? { targetUserId } : {} }),
  add: (attributeId, targetUserId) =>
    api.post(`/UserAttribute/${attributeId}`, null, { params: targetUserId ? { targetUserId } : {} }),
  remove: (attributeId, targetUserId) =>
    api.delete(`/UserAttribute/${attributeId}`, { params: targetUserId ? { targetUserId } : {} }),
  setValue: (model, targetUserId) =>
    api.put('/UserAttribute/value', model, { params: targetUserId ? { targetUserId } : {} }),
};