import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import { authSession } from '@/services/auth/authSession';
import { useAuthStore } from '@/stores/authStore';

const AUTH_EXCLUDED_PATHS = [
  '/auth/kakao/login/teacher',
  '/admin/auth/login',
  '/auth/teachers/signup',
];

const shouldSkipUnauthorizedHandling = (url?: string) => {
  if (!url) {
    return false;
  }

  return AUTH_EXCLUDED_PATHS.some(path => url.includes(path));
};

const resetAuthState = () => {
  authSession.clearSession();
  useAuthStore.getState().setSignedOut();
};

const onRequest = (config: InternalAxiosRequestConfig) => {
  const accessToken = authSession.getAccessToken();

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

const onRequestError = (error: AxiosError) => Promise.reject(error);

const onResponse = (response: AxiosResponse) => response;

const onResponseError = (error: AxiosError) => {
  const status = error.response?.status;
  const requestUrl = error.config?.url;

  if (status === 401 && !shouldSkipUnauthorizedHandling(requestUrl)) {
    resetAuthState();
  }

  return Promise.reject(error);
};

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(onRequest, onRequestError);
  instance.interceptors.response.use(onResponse, onResponseError);

  return instance;
};
