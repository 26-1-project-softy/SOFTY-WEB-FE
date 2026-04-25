import { getKakaoLoginErrorMessage } from '@/features/auth/lib/getKakaoLoginErrorMessage';
import { authApi, teacherAuthApi } from '@/services/auth';

type ProcessTeacherKakaoCallbackParams = {
  code: string;
  redirectUri?: string;
};

type ProcessTeacherKakaoCallbackResult =
  | {
      status: 'error';
      message: string;
    }
  | {
      status: 'signup_required';
      accessToken: string;
      refreshToken: string;
    }
  | {
      status: 'signed_in';
      accessToken: string;
      refreshToken: string;
      role: 'teacher' | 'admin';
      user: {
        name: string;
        grade?: number;
        classNumber?: number;
      };
    };

const KAKAO_LOGIN_ERROR_MESSAGE = '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';

export const processTeacherKakaoCallback = async ({
  code,
  redirectUri,
}: ProcessTeacherKakaoCallbackParams): Promise<ProcessTeacherKakaoCallbackResult> => {
  if (!code || !redirectUri) {
    return {
      status: 'error',
      message:
        getKakaoLoginErrorMessage(new Error(KAKAO_LOGIN_ERROR_MESSAGE)) ??
        '카카오 로그인에 실패했어요',
    };
  }

  const response = await teacherAuthApi.loginWithKakao({
    code,
    redirectUri,
  });

  const accessToken = response.data?.accessToken;
  const refreshToken = response.data?.refreshToken;

  if (!response.success || !accessToken || !refreshToken) {
    return {
      status: 'error',
      message:
        getKakaoLoginErrorMessage(new Error(response.message || KAKAO_LOGIN_ERROR_MESSAGE)) ??
        '카카오 로그인에 실패했어요',
    };
  }

  if (response.data.registrationRequired) {
    return {
      status: 'signup_required',
      accessToken,
      refreshToken,
    };
  }

  const me = await authApi.getMe(accessToken);

  return {
    status: 'signed_in',
    accessToken,
    refreshToken,
    role: me.role,
    user: me.user,
  };
};
