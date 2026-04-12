import { apiClient } from './axios';

// 명세서 상의 OUT 데이터 타입 정의
export interface LoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const adminLoginApi = async (loginId: string, password: string): Promise<LoginResponse> => {
  // 명세서 상의 POST /admin/auth/login 호출
  const response = await apiClient.post<LoginResponse>('/admin/auth/login', {
    loginId,
    password
  });
  return response.data;
};

export interface TeacherSignupResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    userId: number;
    role: string;
  };
}

export const teacherSignupApi = async (
  kakaoAccessToken: string,
  teacherName: string,
  schoolName: string,
  grade: number,
  classNumber: number
): Promise<TeacherSignupResponse> => {
  const response = await apiClient.post<TeacherSignupResponse>(
    '/auth/teachers/signup',
    {
      kakaoAccessToken,
      teacherName,
      schoolName,
      grade,
      classNumber
    },
    {
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`
      }
    }
  );
  return response.data;
};

export interface ClassCodeResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    classCode: string;
  };
}

export const createClassCodeApi = async (): Promise<ClassCodeResponse> => {
  const response = await apiClient.post<ClassCodeResponse>('/auth/teachers/classcode');
  return response.data;
};

export interface KakaoLoginResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const kakaoLoginApi = async (kakaoAccessToken: string): Promise<KakaoLoginResponse> => {
  const response = await apiClient.post<KakaoLoginResponse>('/auth/kakao/login', {
    kakaoAccessToken
  });
  return response.data;
};

export interface KakaoCallbackData {
  accessToken: string;
  tokenType?: string;
  refreshToken?: string;
  userId?: number;
  name?: string;
  role?: string;
  provider?: string;
  registrationRequired: boolean;
}

interface KakaoCallbackWrappedResponse {
  success: boolean;
  code: number;
  message: string;
  data: KakaoCallbackData;
}

interface KakaoCallbackQuery {
  code: string;
  state?: string;
  error?: string;
}

export const getKakaoLoginStartUrl = (): string => {
  // OAuth 시작 요청은 백엔드 도메인으로 직접 보내야 세션 쿠키/redirect 흐름이 안정적입니다.
  const apiBaseUrl = import.meta.env.VITE_API_URL || 'https://softy2.duckdns.org';
  return `${apiBaseUrl}/auth/kakao/login?prompt=login`;
};

export const kakaoCallbackApi = async (query: KakaoCallbackQuery): Promise<KakaoCallbackData> => {
  const response = await apiClient.get<KakaoCallbackWrappedResponse | KakaoCallbackData>('/auth/kakao/callback', {
    params: query
  });

  if ('data' in response.data) {
    return response.data.data;
  }

  return response.data;
};

export interface WithdrawResponse {
  success: boolean;
  code: number;
  message: string;
}

export const withdrawUserApi = async (): Promise<WithdrawResponse> => {
  const response = await apiClient.delete<WithdrawResponse>('/users/me');
  return response.data;
};

