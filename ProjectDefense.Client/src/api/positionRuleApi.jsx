
import api from './axiosConfig';
 
export default {
  getRules: (positionId) => api.get(`/position/${positionId}/rules`),
  setRules: (positionId, rules) => api.put(`/position/${positionId}/rules`, rules),
};
 
