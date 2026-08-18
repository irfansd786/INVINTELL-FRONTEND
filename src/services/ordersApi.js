import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function fetchOrdersAPI(endpoint, options = {}) {
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
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.message || `HTTP ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (e) {
    console.warn(`[ordersApi] Endpoint ${endpoint} warning:`, e.message);
    return { success: false, message: e.message };
  }
}

export const ordersApi = {
  getAll: () => fetchOrdersAPI('/orders'),
  getById: (id) => fetchOrdersAPI(`/orders/${id}`),
  create: (data) => fetchOrdersAPI('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateStatus: (id, status) => fetchOrdersAPI(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
};
