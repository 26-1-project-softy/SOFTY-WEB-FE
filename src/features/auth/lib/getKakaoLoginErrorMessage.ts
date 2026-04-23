import { AxiosError } from 'axios';
import { getAuthErrorMessage } from '@/features/auth/lib/getAuthErrorMessage';

const KAKAO_LOGIN_ERROR_MESSAGE = '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';

export const getKakaoLoginErrorMessage = (error: unknown): string | null => {
  if (error instanceof AxiosError) {
    const message = getAuthErrorMessage(error, '');
    const normalizedMessage = message.toLowerCase();

    if (
      normalizedMessage.includes('cancel') ||
      normalizedMessage.includes('canceled') ||
      normalizedMessage.includes('access_denied')
    ) {
      return null;
    }

    if (normalizedMessage.includes('network')) {
      return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
    }

    if (message) {
      return message;
    }

    return KAKAO_LOGIN_ERROR_MESSAGE;
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
      return '네트워크 연결을 확인한 뒤 다시 시도해 주세요.';
    }

    if (message) {
      return message;
    }

    return KAKAO_LOGIN_ERROR_MESSAGE;
  }

  return KAKAO_LOGIN_ERROR_MESSAGE;
};
