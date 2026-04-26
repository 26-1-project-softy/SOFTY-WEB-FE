import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { InvalidAuthenticatedUserResponseError } from '@/services/auth/authApi';
import { authApi, authSession } from '@/services/auth';
import { useAuthStore } from '@/stores/authStore';

const RETRYABLE_STATUS_CODES = [500, 502, 503, 504] as const;
const AUTH_INITIALIZATION_RETRY_DELAYS = [300, 700, 1200] as const;

const delay = (ms: number) =>
  new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });

const isUnauthorizedError = (error: unknown) => {
  return error instanceof AxiosError && error.response?.status === 401;
};

const isRetryableError = (error: unknown) => {
  if (!(error instanceof AxiosError)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const status = error.response.status;

  return RETRYABLE_STATUS_CODES.includes(status as (typeof RETRYABLE_STATUS_CODES)[number]);
};

const isInvalidAuthenticatedUserResponseError = (error: unknown) => {
  return error instanceof InvalidAuthenticatedUserResponseError;
};

const getMeWithRetry = async () => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= AUTH_INITIALIZATION_RETRY_DELAYS.length; attempt += 1) {
    try {
      return await authApi.getMe();
    } catch (error) {
      lastError = error;

      if (!isRetryableError(error)) {
        throw error;
      }

      if (attempt === AUTH_INITIALIZATION_RETRY_DELAYS.length) {
        break;
      }

      await delay(AUTH_INITIALIZATION_RETRY_DELAYS[attempt]);
    }
  }

  throw lastError;
};

export const useInitializeAuth = () => {
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);
  const setSignedOut = useAuthStore(state => state.setSignedOut);
  const setSignupRequired = useAuthStore(state => state.setSignupRequired);
  const setOnboardingRequired = useAuthStore(state => state.setOnboardingRequired);
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

      if (authStatus === 'ONBOARDING_REQUIRED') {
        if (isMounted) {
          setOnboardingRequired({
            role: 'teacher',
            user: null,
          });
          setAuthInitialized(true);
        }

        return;
      }

      try {
        const me = await getMeWithRetry();

        if (!isMounted) {
          return;
        }

        authSession.setAuthStatus('SIGNED_IN');
        setSignedIn({
          role: me.role,
          user: me.user,
        });
      } catch (error) {
        const shouldInvalidateSession =
          isUnauthorizedError(error) || isInvalidAuthenticatedUserResponseError(error);

        if (shouldInvalidateSession || isRetryableError(error)) {
          authSession.clearSession();

          if (isMounted) {
            setSignedOut();
          }
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
  }, [setAuthInitialized, setOnboardingRequired, setSignedIn, setSignedOut, setSignupRequired]);
};
