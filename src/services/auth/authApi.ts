import { apiClient } from '@/services/http/apiClient';
import type { AuthRole } from '@/stores/authStore';

type BackendRole = 'TEACHER' | 'ADMIN';

export type MeResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    role: BackendRole;
    name: string;
    grade: number | null;
    class: number | null;
  };
  role?: BackendRole;
  name?: string;
  grade?: number | null;
  class?: number | null;
};

const normalizeRole = (role: BackendRole): Exclude<AuthRole, null> => {
  if (role === 'TEACHER') {
    return 'teacher';
  }

  return 'admin';
};

export const authApi = {
  getMe: async () => {
    const { data } = await apiClient.get<MeResponse>('/users/me');
    const profile = data.data ?? data;

    if (!profile.role || !profile.name) {
      throw new Error('유효하지 않은 사용자 정보 응답입니다.');
    }

    return {
      role: normalizeRole(profile.role),
      user: {
        name: profile.name,
        grade: profile.grade ?? undefined,
        classNumber: profile.class ?? undefined,
      },
    };
  },
};
