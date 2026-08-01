import api from './axiosConfig';

export default {
  generateToken: (positionId) => api.post(`/position/${positionId}/generate-api-token`),
};