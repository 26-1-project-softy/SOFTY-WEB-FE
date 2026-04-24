import { apiClient } from '@/services/http/apiClient';

export type KakaoLoginRequest = {
  code: string;
  redirectUri: string;
};

export type KakaoLoginResponse = {
  success: boolean;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    registrationRequired: boolean;
  };
};

export const kakaoApi = {
  login: async (payload: KakaoLoginRequest) => {
    const { data } = await apiClient.post<KakaoLoginResponse>('/auth/kakao/login', payload);

    return data;
  },
};
