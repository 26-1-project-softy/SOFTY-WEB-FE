import { apiClient } from '@/services/http/apiClient';

export type MeResponse = {
  success: boolean;
  code: number;
  message: string;
  role: 'teacher' | 'admin';
  name: string;
  grade: number;
  class: number;
};

export const authApi = {
  getMe: async () => {
    const { data } = await apiClient.get<MeResponse>('/auth/me');

    return {
      role: data.role,
      user: {
        name: data.name,
        grade: data.grade,
        classNumber: data.class,
      },
    };
  },
};
