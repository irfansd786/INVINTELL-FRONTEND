import { api } from './api';

export const inventoryApi = {
  getAll: () => api.getInventory(),
  getLowStock: () => api.getLowStock(),
  getOutOfStock: () => api.getOutOfStock(),
  getCritical: () => api.getCriticalInventory()
};
