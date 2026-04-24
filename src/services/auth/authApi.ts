import { apiClient } from '@/services/http/apiClient';

export type MeResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    role: 'teacher' | 'admin';
    name: string;
    grade: number | null;
    class: number | null;
  };
  role?: 'teacher' | 'admin';
  name?: string;
  grade?: number | null;
  class?: number | null;
};

export const authApi = {
  getMe: async () => {
    const { data } = await apiClient.get<MeResponse>('/users/me');
    const profile = data.data ?? data;

    if (!profile.role || !profile.name) {
      throw new Error('유효하지 않은 사용자 정보 응답입니다.');
    }

    if (profile.role !== 'teacher' && profile.role !== 'admin') {
      throw new Error('유효하지 않은 사용자 역할입니다.');
    }

    return {
      role: profile.role,
      user: {
        name: profile.name,
        grade: profile.grade ?? undefined,
        classNumber: profile.class ?? undefined,
      },
    };
  },
};
