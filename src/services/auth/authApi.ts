import { apiClient } from '@/services/http/apiClient';

export type MeResponse = {
  success: boolean;
  code: number;
  message: string;
  data?: {
    role: string;
    name: string;
    grade: number | null;
    class: number | null;
  };
  role?: string;
  name?: string;
  grade?: number | null;
  class?: number | null;
};

const normalizeRole = (role: string): 'teacher' | 'admin' => {
  const normalized = role.toLowerCase();

  if (normalized === 'teacher' || normalized === 'admin') {
    return normalized;
  }

  throw new Error('Unsupported user role');
};

export const authApi = {
  getMe: async (accessToken?: string) => {
    const { data } = await apiClient.get<MeResponse>('/users/me', {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
    });
    const me = data.data ?? data;

    if (!me.role || !me.name) {
      throw new Error('Invalid user profile response');
    }

    return {
      role: normalizeRole(me.role),
      user: {
        name: me.name,
        grade: me.grade ?? undefined,
        classNumber: me.class ?? undefined,
      },
    };
  },
};

export { adminApi } from '@/services/auth/adminApi';
export type { AdminLoginRequest, AdminLoginResponse } from '@/services/auth/adminApi';
export { teacherApi } from '@/services/auth/teacherApi';
export type { TeacherSignUpRequest, TeacherSignUpResponse } from '@/services/auth/teacherApi';
export { kakaoApi } from '@/services/auth/kakaoApi';
export type { KakaoLoginRequest, KakaoLoginResponse } from '@/services/auth/kakaoApi';
export { userApi } from '@/services/auth/userApi';
export type { DeleteMeResponse } from '@/services/auth/userApi';
