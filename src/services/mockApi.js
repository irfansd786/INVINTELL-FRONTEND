/**
 * INVINTELL Backend API Delegate Client
 * Replaces simulated mock API with real backend calls.
 */
import { api } from './api';

export const mockApi = {
  getOverviewMetrics: () => api.getDashboardSummary(),
  getRiskCenterData: () => api.getRisks(),
  getInventoryCatalog: () => api.getInventory(),
  getWarehouseList: () => api.getInventory(),
  getSalesData: () => api.getSales(),
  getFinanceData: () => api.getFinanceSummary(),
  getProductById: async (id) => {
    const res = await api.getProductById(id);
    return res?.data || null;
  },
  getProducts: (params) => api.getProducts(params),
  getInventory: () => api.getInventory(),
  getSales: (params) => api.getSales(params),
  getRisks: () => api.getRisks()
};

export default mockApi;
