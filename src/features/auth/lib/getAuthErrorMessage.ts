import { AxiosError } from 'axios';

type ErrorResponseBody = {
  code?: number;
  message?: string;
};

export const getAuthErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ErrorResponseBody>;
    const status = axiosError.response?.status;
    const code = axiosError.response?.data?.code;
    const message = axiosError.response?.data?.message?.trim();

    if (message) {
      return message;
    }

    if (status === 401) {
      return '인증 정보가 유효하지 않아요. 다시 시도해 주세요.';
    }

    if (status === 403) {
      return '접근 권한이 없어요.';
    }

    if (status === 404) {
      return '요청한 정보를 찾을 수 없어요.';
    }

    if (status === 409 || code === 409 || code === 312) {
      return '이미 처리된 요청이에요.';
    }

    if (code === 313) {
      return '현재 상태에서는 요청을 처리할 수 없어요.';
    }

    if (status === 422) {
      return '입력 정보를 다시 확인해 주세요.';
    }

    if (status === 500 || code === 309 || code === 310 || code === 311) {
      return '서버 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
    }

    if (status === 502 || status === 503 || status === 504) {
      return '서버 연결이 원활하지 않아요. 잠시 후 다시 시도해 주세요.';
    }
  }

  if (error instanceof Error) {
    const message = error.message.trim();

    if (message) {
      return message;
    }
  }

  return fallbackMessage;
};
