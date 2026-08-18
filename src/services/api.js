import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://invintell-backend.onrender.com/api';

async function fetchAPI(endpoint, options = {}) {
  try {
    let authHeader = {};
    const token = await authService.getIdToken();
    if (token) {
      authHeader = { 'Authorization': `Bearer ${token}` };
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
        ...options.headers
      },
      ...options
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (error) {
    console.warn(`[INVINTELL API Client] Endpoint ${endpoint} warning:`, error.message);
    return null;
  }
}

export const api = {
  // Staff Profile & Permissions API
  getCurrentUserProfile: () => fetchAPI('/staff/me'),
  getAllStaff: () => fetchAPI('/staff'),
  createStaff: (data) => fetchAPI('/staff', { method: 'POST', body: JSON.stringify(data) }),
  updateStaff: (id, data) => fetchAPI(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  toggleStaffStatus: (id, status) => fetchAPI(`/staff/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  deleteStaff: (id) => fetchAPI(`/staff/${id}`, { method: 'DELETE' }),

  // Products & Barcode API
  getProducts: (params = {}) => fetchAPI(`/products?${new URLSearchParams(params).toString()}`),
  getProductById: (id) => fetchAPI(`/products/${id}`),
  getProductByBarcode: (barcode) => fetchAPI(`/products/barcode/${encodeURIComponent(barcode)}`),

  // Inventory & Barcode Reconciliation API
  getInventory: (params = {}) => fetchAPI(`/inventory?${new URLSearchParams(params).toString()}`),
  getLowStock: () => fetchAPI('/inventory/low-stock'),
  getOutOfStock: () => fetchAPI('/inventory/out-of-stock'),
  getCriticalInventory: () => fetchAPI('/inventory/critical'),
  getInventoryByBarcode: (barcode) => fetchAPI(`/inventory/barcode/${encodeURIComponent(barcode)}`),
  adjustInventory: (data) => fetchAPI('/inventory/adjust', { method: 'POST', body: JSON.stringify(data) }),
  reconcileInventory: (data) => fetchAPI('/inventory/reconcile', { method: 'POST', body: JSON.stringify(data) }),

  // Phase 4 & Phase 5 Enterprise Analytics & Audit
  getAnalyticsOverview: () => fetchAPI('/analytics/overview'),
  getSalesAnalytics: (params = {}) => fetchAPI(`/analytics/sales?${new URLSearchParams(params).toString()}`),
  getInventoryAnalytics: () => fetchAPI('/analytics/inventory'),
  getFulfillmentAnalytics: () => fetchAPI('/analytics/fulfillment'),
  getForecasts: () => fetchAPI('/forecasts'),
  getEvents: () => fetchAPI('/events'),
  createEvent: (data) => fetchAPI('/events', { method: 'POST', body: JSON.stringify(data) }),

  // Phase 5 Audit Logs & Bulk CSV Operations
  getAuditLogs: (params = {}) => fetchAPI(`/audit-logs?${new URLSearchParams(params).toString()}`),
  importProductsBulk: (csvText) => fetchAPI('/bulk/import-products/validate', { method: 'POST', body: JSON.stringify({ csvText }) }),
  confirmProductsBulk: (validRows) => fetchAPI('/bulk/import-products/confirm', { method: 'POST', body: JSON.stringify({ validRows }) }),
  exportBulkCSV: (entityType) => fetchAPI(`/bulk/export/${entityType}`),
  getReportData: (type, params = {}) => fetchAPI(`/reports/${type}?${new URLSearchParams(params).toString()}`),

  // Global Search API
  searchGlobal: (query) => fetchAPI(`/search?q=${encodeURIComponent(query)}`),

  // Cycle Counting System
  getCycleCounts: () => fetchAPI('/cycle-counts'),
  createCycleCount: (data) => fetchAPI('/cycle-counts', { method: 'POST', body: JSON.stringify(data) }),
  updateCycleCountItem: (id, data) => fetchAPI(`/cycle-counts/${id}/items`, { method: 'POST', body: JSON.stringify(data) }),
  completeCycleCount: (id) => fetchAPI(`/cycle-counts/${id}/complete`, { method: 'POST' }),

  // Operations
  getAllocations: () => fetchAPI('/allocations'),
  performAllocation: (data) => fetchAPI('/allocations', { method: 'POST', body: JSON.stringify(data) }),
  getPicking: () => fetchAPI('/picking'),
  completePickingTask: (id) => fetchAPI(`/picking/${id}/complete`, { method: 'POST' }),
  getPacking: () => fetchAPI('/packing'),
  completePackingTask: (id) => fetchAPI(`/packing/${id}/complete`, { method: 'POST' }),
  getDispatch: () => fetchAPI('/dispatch'),
  confirmDispatch: (id) => fetchAPI(`/dispatch/${id}/confirm`, { method: 'POST' }),
  getExceptions: () => fetchAPI('/exceptions'),
  createException: (data) => fetchAPI('/exceptions', { method: 'POST', body: JSON.stringify(data) }),
  resolveException: (id) => fetchAPI(`/exceptions/${id}/resolve`, { method: 'PATCH' }),
  getTransfers: () => fetchAPI('/transfers'),
  createTransfer: (data) => fetchAPI('/transfers', { method: 'POST', body: JSON.stringify(data) }),
  getSuppliers: () => fetchAPI('/suppliers'),
  getStockMovements: () => fetchAPI('/stock-movements'),

  // Sales & Finance
  getSales: (params = {}) => fetchAPI(`/sales?${new URLSearchParams(params).toString()}`),
  getSalesSummary: () => fetchAPI('/sales/summary'),
  getSalesTrends: () => fetchAPI('/sales/trends'),
  getFinanceSummary: () => fetchAPI('/finance/summary'),
  getProductPerformance: () => fetchAPI('/finance/product-performance'),
  getWarehousePerformance: () => fetchAPI('/finance/warehouse-performance'),

  // Dashboard
  getDashboardSummary: () => fetchAPI('/dashboard/summary'),

  // Risks Engine
  getRisks: () => fetchAPI('/risks'),
  applyRiskRecommendation: (id) => fetchAPI(`/risks/${id}/apply`, { method: 'POST' }),
  modifyRiskRecommendation: (id, payload) => fetchAPI(`/risks/${id}/modify`, { method: 'POST', body: JSON.stringify(payload) }),

  // Phase 2 Intelligence Engine
  getDemandAnalysis: () => fetchAPI('/intelligence/demand'),
  getReorderRecommendations: () => fetchAPI('/intelligence/reorder'),
  getFEFOBatches: (productId) => fetchAPI(`/intelligence/fefo-batches${productId ? `?productId=${encodeURIComponent(productId)}` : ''}`),
  getBusinessInsights: () => fetchAPI('/intelligence/insights')
};
