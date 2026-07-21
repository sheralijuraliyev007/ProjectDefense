import api from './axiosConfig';

export default {
  attributeCategories: () => api.get('/lookups/AttributeCategoriesSelect'),
  attributeTypes: () => api.get('/lookups/AttributeTypesSelect'),
  roles: () => api.get('/lookups/RolesSelect'),
};