import api from './axiosConfig';

export default {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),
  getCurrentUser: () => api.get('/auth/me'),
  socialLogin: (provider) => {
    window.location.href = `${api.defaults.baseURL}/auth/${provider}`;
  },
};