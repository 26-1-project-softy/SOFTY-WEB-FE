import { apiClient } from '@/services/http/apiClient';

export type AdminLoginRequest = {
  loginId: string;
  password: string;
};

export type AdminLoginResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
};

export const adminApi = {
  login: async (payload: AdminLoginRequest) => {
    const { data } = await apiClient.post<AdminLoginResponse>('/admin/auth/login', payload);

    return data;
  },
};
