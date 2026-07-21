import api from './axiosConfig';

export default {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  socialLogin: (provider, idToken) => api.post('/auth/social-login', { provider, idToken }),
  verifyEmail : (token) => api.get('/auth/verify-email',{params:{token}}),
};