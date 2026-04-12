import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || 'https://softy2.duckdns.org';

// 환경변수(VITE_API_URL)에서 백엔드 주소를 가져옵니다.
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // 프론트랑 서버랑 주소가 다를 때 쿠키 연동 시 필요할 수 있음
  // withCredentials: true,
});

const PUBLIC_AUTH_PATHS = ['/admin/auth/login', '/auth/kakao/login', '/auth/kakao/callback'];

const isPublicAuthRequest = (url?: string): boolean => {
  if (!url) return false;
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
};

const getLoginRedirectPath = (): string => {
  const pathname = window.location.pathname;
  const isAdminArea = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');
  return isAdminArea ? '/admin' : '/teacher/login';
};

// JWT 토큰을 매 API 요청마다 헤더에 자동 포함시키는 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');

    const hasAuthorizationHeader =
      Boolean((config.headers as Record<string, string | undefined>)?.Authorization) ||
      Boolean((config.headers as Record<string, string | undefined>)?.authorization);

    if (token && !hasAuthorizationHeader && !isPublicAuthRequest(config.url)) {
      config.headers.Authorization = `Bearer ${token}`; // JWT Bearer 규격 적용
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url as string | undefined;

    if (status === 401 && !isPublicAuthRequest(requestUrl) && typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('pendingKakaoAccessToken');

      const redirectPath = getLoginRedirectPath();
      if (window.location.pathname !== redirectPath) {
        window.location.replace(redirectPath);
      }
    }

    return Promise.reject(error);
  }
);
