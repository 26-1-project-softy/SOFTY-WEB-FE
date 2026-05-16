import { isAxiosError } from 'axios';

export const getThreadDetailErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | string
      | undefined;

    if (status === 400) {
      return '요청 형식이 올바르지 않아요. analysisId와 content 값을 확인해 주세요.';
    }

    if (status === 401) {
      return '로그인이 만료되었어요. 다시 로그인해 주세요.';
    }

    if (status === 403) {
      return '이 채팅방에 메시지를 전송할 권한이 없어요';
    }

    if (status === 404) {
      return '채팅방 또는 분석 결과를 찾을 수 없어요';
    }

    if (status === 502) {
      return 'AI 서버와 통신 중 오류가 발생했어요';
    }

    if (status === 503) {
      return 'AI 분석 서버를 일시적으로 사용할 수 없어요';
    }

    if (status === 504) {
      return 'AI 분석 응답 시간이 초과되었어요';
    }

    if (typeof data === 'string' && data.trim()) {
      return data;
    }

    const messageFromBody =
      (typeof data === 'object' && data?.message) ||
      (typeof data === 'object' && data?.error) ||
      (typeof data === 'object' && data?.detail);

    if (messageFromBody && messageFromBody.trim()) {
      return messageFromBody;
    }

    return `${fallback} (HTTP ${status ?? '알 수 없음'})`;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};
