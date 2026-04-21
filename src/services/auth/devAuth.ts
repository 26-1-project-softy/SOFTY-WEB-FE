import type { AuthRole, AuthUserSummary } from '@/stores/authStore';
import { authSession } from '@/services/auth/authSession';

type ApplyDevLoginParams = {
  setAuth: (payload: {
    isAuthenticated: boolean;
    role: AuthRole;
    user: AuthUserSummary | null;
  }) => void;
  setAuthInitialized: (isAuthInitialized: boolean) => void;
};

const parseDevLoginRole = (): AuthRole => {
  if (!import.meta.env.DEV) {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  const devLogin = params.get('devLogin')?.trim().toLowerCase();

  if (devLogin === 'teacher' || devLogin === 'admin') {
    return devLogin;
  }

  return null;
};

export const applyDevLogin = ({ setAuth, setAuthInitialized }: ApplyDevLoginParams): boolean => {
  const role = parseDevLoginRole();

  if (!role) {
    return false;
  }

  authSession.setTokens({
    accessToken: `dev-access-token-${role}`,
    refreshToken: `dev-refresh-token-${role}`,
  });

  setAuth({
    isAuthenticated: true,
    role,
    user:
      role === 'teacher'
        ? {
            name: '개발용 교사',
            grade: 3,
            classNumber: 2,
          }
        : {
            name: '개발용 관리자',
          },
  });
  setAuthInitialized(true);

  return true;
};
