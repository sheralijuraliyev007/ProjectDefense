import api from './axiosConfig';

export default {
  attributeCategories: () => api.get('/lookups/AttributeCategoriesSelect'),
  attributeTypes: () => api.get('/lookups/AttributeTypesSelect'),
  ruleOperators: () => api.get('/lookups/RuleOperatorsSelect'),
  roles: () => api.get('/lookups/RolesSelect'),
};