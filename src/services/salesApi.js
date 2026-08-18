import { api } from './api';

export const salesApi = {
  getAll: (params) => api.getSales(params),
  getSummary: () => api.getSalesSummary(),
  getTrends: () => api.getSalesTrends()
};
