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

export type DevLoginRequest = {
  socialId: string;
  role?: 'teacher' | 'admin';
  nickname?: string;
};

export const kakaoApi = {
  login: async (payload: KakaoLoginRequest) => {
    const { data } = await apiClient.post<KakaoLoginResponse>('/auth/kakao/login', payload);

    return data;
  },
  devLogin: async (params: DevLoginRequest) => {
    // Backend spec has been exposed with a typo key (`soicalId`) in some environments.
    // Send both keys for compatibility.
    const requestParams = {
      ...params,
      soicalId: params.socialId,
    };

    const { data } = await apiClient.post<KakaoLoginResponse>('/auth/dev-login', null, {
      params: requestParams,
    });

    return data;
  },
};
