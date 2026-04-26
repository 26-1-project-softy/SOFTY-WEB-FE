import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/http/apiClient';
import type { AuthRole } from '@/stores/authStore';

type BackendRole = 'TEACHER' | 'ADMIN';

type AuthRequestConfig = AxiosRequestConfig & {
  skipUnauthorizedHandling?: boolean;
};

export class InvalidAuthenticatedUserResponseError extends Error {
  constructor() {
    super('유효하지 않은 사용자 인증 응답입니다.');
    this.name = 'InvalidAuthenticatedUserResponseError';
  }
}

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

  if (role === 'ADMIN') {
    return 'admin';
  }

  throw new InvalidAuthenticatedUserResponseError();
};

export const authApi = {
  getMe: async (accessToken?: string) => {
    const requestConfig: AuthRequestConfig = {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      skipUnauthorizedHandling: Boolean(accessToken),
    };

    const { data } = await apiClient.get<MeResponse>('/users/me', requestConfig);
    const profile = data.data ?? data;

    if (!profile.role || !profile.name?.trim()) {
      throw new InvalidAuthenticatedUserResponseError();
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
