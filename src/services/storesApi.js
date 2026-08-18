import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const storesApi = {
  getAll: async () => {
    try {
      let authHeader = {};
      const token = await authService.getIdToken();
      if (token) {
        authHeader = { 'Authorization': `Bearer ${token}` };
      }
      const res = await fetch(`${API_URL}/stores`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },
  getById: async (id) => {
    try {
      let authHeader = {};
      const token = await authService.getIdToken();
      if (token) {
        authHeader = { 'Authorization': `Bearer ${token}` };
      }
      const res = await fetch(`${API_URL}/stores/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          ...authHeader
        }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};
