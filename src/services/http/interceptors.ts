import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { authSession } from '@/services/auth/authSession';

const onRequest = (config: InternalAxiosRequestConfig) => {
  const accessToken = authSession.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
};

const onRequestError = (error: AxiosError) => {
  return Promise.reject(error);
};

const onResponseError = (error: AxiosError) => {
  const status = error.response?.status;

  if (status === 401) {
    // TODO: 인증 만료/미인증 처리
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
