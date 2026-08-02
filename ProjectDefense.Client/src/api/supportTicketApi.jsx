import api from '/axiosConfig';

export default {
    create : (payload) => api.post('/support-ticket', payload),
}