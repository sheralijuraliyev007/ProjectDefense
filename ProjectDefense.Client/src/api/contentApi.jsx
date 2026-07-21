// src/api/contentApi.js
import api from './axiosConfig';

const contentApi = {
  getUploadSignature: () => api.get('/content/upload-signature'),
  confirmUpload: (data) => api.post('/content/confirm-upload', data),

  // Full upload flow: get signature → upload to Cloudinary → confirm with backend
  uploadImage: async (file) => {
    // 1. Get signature from backend
    const { data: sigData } = await api.get('/content/upload-signature');
    const signature = sigData.data;

    // 2. Upload to Cloudinary directly
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', signature.apiKey);
    formData.append('timestamp', signature.timestamp);
    formData.append('signature', signature.signature);
    if (signature.folder) formData.append('folder', signature.folder);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`;
    const uploadRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });
    const uploadResult = await uploadRes.json();

    if (!uploadRes.ok) {
      throw new Error(uploadResult.error?.message || 'Cloudinary upload failed');
    }

    // 3. Confirm with backend
    const confirmRes = await api.post('/content/confirm-upload', {
      publicId: uploadResult.public_id,
      originalFilename: file.name,
      mimeType: file.type,
    });

    return confirmRes.data.data; 
  },
};

export default contentApi;