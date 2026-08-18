import { api } from './api';

export const riskApi = {
  getAll: () => api.getRisks(),
  applyAction: (id) => api.applyRiskRecommendation(id),
  modifyAction: (id, payload) => api.modifyRiskRecommendation(id, payload)
};
