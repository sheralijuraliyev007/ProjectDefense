import api from './axiosConfig';

export default {
  getUploadSignature: () => api.get('/content/upload-signature'),
  confirmUpload: (data) => api.post('/content/confirm-upload', data),
};