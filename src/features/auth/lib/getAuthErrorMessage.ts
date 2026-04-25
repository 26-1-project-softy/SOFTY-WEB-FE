import { AxiosError } from 'axios';

type ErrorResponseBody = {
  code?: number;
  message?: string;
};

export type AuthErrorMessage = {
  title: string;
  description?: string;
};

export const getAuthErrorMessage = (
  error: unknown,
  fallbackMessage: AuthErrorMessage
): AuthErrorMessage => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ErrorResponseBody>;
    const status = axiosError.response?.status;
    const code = axiosError.response?.data?.code;
    const message = axiosError.response?.data?.message?.trim();

    if (!axiosError.response) {
      if (axiosError.code === 'ECONNABORTED') {
        return {
          title: '서버 응답이 지연되고 있어요',
          description: '잠시 후 다시 시도해 주세요.',
        };
      }

      return {
        title: '서버에 연결할 수 없어요',
        description: '네트워크 상태를 확인하거나 잠시 후 다시 시도해 주세요.',
      };
    }

    if (message) {
      return {
        title: message,
        description: fallbackMessage.description,
      };
    }

    if (status === 401) {
      return {
        title: '인증 정보가 유효하지 않아요',
        description: '다시 시도해 주세요.',
      };
    }

    if (status === 403) {
      return {
        title: '접근 권한이 없어요',
      };
    }

    if (status === 404) {
      return {
        title: '요청한 정보를 찾을 수 없어요',
      };
    }

    if (status === 409 || code === 409 || code === 312) {
      return {
        title: '이미 처리된 요청이에요',
      };
    }

    if (code === 313) {
      return {
        title: '현재 상태에서는 요청을 처리할 수 없어요',
      };
    }

    if (status === 422) {
      return {
        title: '입력 정보를 다시 확인해 주세요',
      };
    }

    if (status === 500 || code === 309 || code === 310 || code === 311) {
      return {
        title: '서버 처리 중 문제가 발생했어요',
        description: '잠시 후 다시 시도해 주세요.',
      };
    }

    if (status === 502 || status === 503 || status === 504) {
      return {
        title: '서버 연결이 원활하지 않아요',
        description: '잠시 후 다시 시도해 주세요.',
      };
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();

    if (message) {
      return {
        title: message,
        description: fallbackMessage.description,
      };
    }
  }

  return fallbackMessage;
};
