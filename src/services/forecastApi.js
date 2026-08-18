const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const forecastApi = {
  getAll: async () => {
    try {
      const res = await fetch(`${API_URL}/forecasts`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};
