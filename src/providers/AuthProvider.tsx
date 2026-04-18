import { useEffect, type PropsWithChildren } from 'react';
import { AxiosError } from 'axios';
import { Loader } from '@/components/common/Loader';
import { authApi } from '@/services/auth/authApi';
import { authSession } from '@/services/auth/authSession';
import { useAuthStore } from '@/stores/authStore';

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const isAuthInitialized = useAuthStore(state => state.isAuthInitialized);
  const setAuthInitialized = useAuthStore(state => state.setAuthInitialized);
  const setAuth = useAuthStore(state => state.setAuth);
  const clearAuth = useAuthStore(state => state.clearAuth);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      const accessToken = authSession.getAccessToken();

      if (!accessToken) {
        clearAuth();
        if (isMounted) {
          setAuthInitialized(true);
        }
        return;
      }

      try {
        const me = await authApi.getMe();

        if (!isMounted) {
          return;
        }

        setAuth({
          isAuthenticated: true,
          role: me.role,
          user: me.user,
        });
      } catch (error) {
        const axiosError = error as AxiosError;

        if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
          authSession.clearTokens();
        }

        if (isMounted) {
          clearAuth();
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
  }, [clearAuth, setAuth, setAuthInitialized]);

  if (!isAuthInitialized) {
    return <Loader />;
  }

  return children;
};
