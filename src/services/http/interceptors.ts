import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ROUTES } from '@/constants/routes';
import { authSession } from '@/services/auth/authSession';
import { useAuthStore } from '@/stores/authStore';

const onRequest = (config: InternalAxiosRequestConfig) => {
  const accessToken = authSession.getAccessToken();

  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

const onRequestError = (error: AxiosError) => {
  return Promise.reject(error);
};

const onResponseError = (error: AxiosError) => {
  const status = error.response?.status;

  if (status === 401 && authSession.getAccessToken()) {
    authSession.clearSession();
    const { clearAuth, setAuthInitialized } = useAuthStore.getState();
    clearAuth();
    setAuthInitialized(true);

    if (window.location.pathname !== ROUTES.root) {
      window.location.replace(ROUTES.root);
    }
  }

  if (status === 403) {
    // TODO: 권한 없음 처리
  }

  if (status === 404) {
    // TODO: 공통 not found UX
  }

  return Promise.reject(error);
};

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(onRequest, onRequestError);
  instance.interceptors.response.use(response => response, onResponseError);

  return instance;
};
