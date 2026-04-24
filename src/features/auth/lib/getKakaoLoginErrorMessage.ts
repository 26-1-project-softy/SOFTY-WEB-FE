import { AxiosError } from 'axios';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';

const KAKAO_LOGIN_ERROR_MESSAGE = {
  title: '카카오 로그인에 실패했어요',
  description: '잠시 후 다시 시도해 주세요.',
};

export const getKakaoLoginErrorMessage = (error: unknown): string | null => {
  if (error instanceof AxiosError) {
    const responseMessage = error.response?.data?.message;
    const errorMessage = error.message.trim();
    const normalizedMessage = `${responseMessage ?? ''} ${errorMessage}`.toLowerCase();

    if (
      normalizedMessage.includes('cancel') ||
      normalizedMessage.includes('canceled') ||
      normalizedMessage.includes('access_denied')
    ) {
      return null;
    }

    return getAuthErrorMessage(error, KAKAO_LOGIN_ERROR_MESSAGE).title;
  }

  if (error instanceof Error) {
    const message = error.message.trim();
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('cancel') ||
      normalizedMessage.includes('canceled') ||
      normalizedMessage.includes('access_denied')
    ) {
      return null;
    }

    if (normalizedMessage.includes('network')) {
      return '서버에 연결할 수 없어요';
    }

    if (message) {
      return message;
    }

    return KAKAO_LOGIN_ERROR_MESSAGE.title;
  }

  return KAKAO_LOGIN_ERROR_MESSAGE.title;
};
