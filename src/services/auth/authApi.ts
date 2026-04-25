import { apiClient } from '@/services/http/apiClient';

type BackendRole = 'teacher' | 'admin' | 'TEACHER' | 'ADMIN' | 'ROLE_TEACHER' | 'ROLE_ADMIN';

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

const normalizeRole = (role: BackendRole): 'teacher' | 'admin' => {
  const normalized = role
    .trim()
    .replace(/^ROLE_/i, '')
    .toLowerCase();

  if (normalized === 'teacher' || normalized === 'admin') {
    return normalized;
  }

  throw new Error('유효하지 않은 사용자 역할입니다.');
};

export const authApi = {
  getMe: async () => {
    const { data } = await apiClient.get<MeResponse>('/users/me');
    const profile = data.data ?? data;

    if (!profile.role || !profile.name?.trim()) {
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
