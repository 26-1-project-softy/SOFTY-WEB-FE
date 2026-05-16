import type { AxiosRequestConfig } from 'axios';
import { apiClient } from '@/services/http/apiClient';
import type { AuthActiveRole } from '@/stores/authStore';

type BackendActiveRole = 'TEACHER' | 'ADMIN';

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
  data: {
    activeRole: BackendActiveRole;
    name: string;
    grade: number | null;
    class: number | null;
  };
};

const normalizeActiveRole = (activeRole: BackendActiveRole): Exclude<AuthActiveRole, null> => {
  if (activeRole === 'TEACHER') {
    return 'teacher';
  }

  if (activeRole === 'ADMIN') {
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
    const profile = data.data;

    if (!profile?.activeRole || !profile.name?.trim()) {
      throw new InvalidAuthenticatedUserResponseError();
    }

    return {
      activeRole: normalizeActiveRole(profile.activeRole),
      user: {
        name: profile.name,
        grade: profile.grade ?? undefined,
        classNumber: profile.class ?? undefined,
      },
    };
  },
};
