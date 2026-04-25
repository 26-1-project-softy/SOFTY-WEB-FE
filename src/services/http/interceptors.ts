import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AxiosHeaders } from 'axios';
import { authSession } from '@/services/auth/authSession';
import { useAuthStore } from '@/stores/authStore';

const AUTH_EXCLUDED_PATHS = [
  '/auth/kakao/login/teacher',
  '/admin/auth/login',
  '/auth/teachers/signup',
];

type AuthRequestConfig = InternalAxiosRequestConfig & {
  skipUnauthorizedHandling?: boolean;
};

const shouldSkipUnauthorizedHandlingByPath = (url?: string) => {
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
  const requestConfig = config as AuthRequestConfig;
  const accessToken = authSession.getAccessToken();

  if (!requestConfig.headers) {
    requestConfig.headers = new AxiosHeaders();
  }

  const hasAuthorizationHeader = requestConfig.headers.has('Authorization');

  if (!hasAuthorizationHeader && accessToken) {
    requestConfig.headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return requestConfig;
};

const onRequestError = (error: AxiosError) => Promise.reject(error);

const onResponse = (response: AxiosResponse) => response;

const onResponseError = (error: AxiosError) => {
  const status = error.response?.status;
  const requestConfig = error.config as AuthRequestConfig | undefined;
  const requestUrl = requestConfig?.url;

  const shouldSkipUnauthorizedHandling =
    requestConfig?.skipUnauthorizedHandling || shouldSkipUnauthorizedHandlingByPath(requestUrl);

  if (status === 401 && !shouldSkipUnauthorizedHandling) {
    resetAuthState();
  }

  return Promise.reject(error);
};

export const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(onRequest, onRequestError);
  instance.interceptors.response.use(onResponse, onResponseError);

  return instance;
};
