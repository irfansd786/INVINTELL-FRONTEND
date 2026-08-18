import { api } from './api';

export const productsApi = {
  getAll: (params) => api.getProducts(params),
  getById: (id) => api.getProductById(id)
};
