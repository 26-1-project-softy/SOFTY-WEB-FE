import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { authApi, authSession } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

const shouldClearSession = (error: unknown) => {
  if (error instanceof AxiosError) {
    const status = error.response?.status;

    return status === 401 || status === 403;
  }

  if (error instanceof Error) {
    return (
      error.message === '유효하지 않은 사용자 정보 응답입니다.' ||
      error.message === '유효하지 않은 사용자 역할입니다.'
    );
  }

  return false;
};

export const useInitializeAuth = () => {
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);
  const setSignedOut = useAuthStore(state => state.setSignedOut);
  const setSignupRequired = useAuthStore(state => state.setSignupRequired);
  const setSignedIn = useAuthStore(state => state.setSignedIn);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const accessToken = authSession.getAccessToken();
      const authStatus = authSession.getAuthStatus();

      if (!accessToken) {
        if (isMounted) {
          setSignedOut();
          setAuthInitialized(true);
        }

        return;
      }

      if (authStatus === 'SIGNUP_REQUIRED') {
        if (isMounted) {
          setSignupRequired();
          setAuthInitialized(true);
        }

        return;
      }

      try {
        const me = await authApi.getMe();

        if (!isMounted) {
          return;
        }

        authSession.setAuthStatus('SIGNED_IN');
        setSignedIn({
          role: me.role,
          user: me.user,
        });
      } catch (error) {
        if (shouldClearSession(error)) {
          authSession.clearSession();
        }

        if (isMounted) {
          setSignedOut();
        }

        if (import.meta.env.DEV) {
          console.error('인증 초기화 실패', error);
        }
      } finally {
        if (isMounted) {
          setAuthInitialized(true);
        }
      }
    };

    void initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [setAuthInitialized, setSignedIn, setSignedOut, setSignupRequired]);
};
