import { apiClient } from '@/services/http/apiClient';

export type DeleteMeResponse = {
  success: boolean;
  code: number;
  message: string;
  data: null;
};

export const userAuthApi = {
  deleteMe: async () => {
    const { data } = await apiClient.delete<DeleteMeResponse>('/users/me');

    return data;
  },
};
