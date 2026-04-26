import { apiClient } from '@/services/http/apiClient';

export const aiModelApi = {
  getLatestEvaluation: async () => {
    const res = await apiClient.get('/admin/models/latest/evaluation');
    return res.data;
  },

  rerunEvaluation: async (payload: { version: string; datasetVersion: string }) => {
    const res = await apiClient.post('/admin/models/latest/evaluation/re-run', payload);
    return res.data;
  },
};
