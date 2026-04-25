import { apiClient } from '@/services/http/apiClient';

export type TeacherKakaoLoginRequest = {
  code: string;
  redirectUri: string;
};

export type TeacherKakaoLoginResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    registrationRequired: boolean;
  };
};

export type TeacherSignUpRequest = {
  teacherName: string;
  schoolName: string;
  grade: number;
  classNumber: number;
  kakaoAccessToken?: string;
};

export type TeacherSignUpResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    userId: number;
    role: string;
  };
};

export const teacherAuthApi = {
  loginWithKakao: async (payload: TeacherKakaoLoginRequest) => {
    const { data } = await apiClient.post<TeacherKakaoLoginResponse>(
      '/auth/kakao/login/teacher',
      payload
    );

    return data;
  },

  signUp: async (payload: TeacherSignUpRequest) => {
    const { kakaoAccessToken, ...requestBody } = payload;
    const headers = kakaoAccessToken ? { Authorization: `Bearer ${kakaoAccessToken}` } : undefined;

    const { data } = await apiClient.post<TeacherSignUpResponse>(
      '/auth/teachers/signup',
      requestBody,
      { headers }
    );

    return data;
  },
};
