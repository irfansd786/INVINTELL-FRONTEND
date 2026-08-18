import { storesApi } from './storesApi';

export const warehouseApi = {
  getAll: () => storesApi.getAll(),
  getById: (id) => storesApi.getById(id)
};
