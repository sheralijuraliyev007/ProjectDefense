import api from "./axiosConfig"

export default {
    sync: (form) => api.post('/crm/sync', form),
};