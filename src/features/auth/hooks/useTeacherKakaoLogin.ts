import { useMemo, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';
import { getKakaoLoginStartUrl } from '@/features/auth/lib/getKakaoUrl';
import { getKakaoLoginErrorMessage } from '@/features/auth/lib/getKakaoLoginErrorMessage';

const KAKAO_LOGIN_START_ERROR = new Error(
  '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.'
);

export const useTeacherKakaoLogin = () => {
  const [isKakaoLoginPending, setIsKakaoLoginPending] = useState(false);
  const showToast = useToastStore(state => state.showToast);

  const kakaoLoginUrl = useMemo(() => getKakaoLoginStartUrl(), []);
  const canStartKakaoLogin = Boolean(kakaoLoginUrl) && !isKakaoLoginPending;

  const handleKakaoLogin = () => {
    if (!canStartKakaoLogin) {
      if (!kakaoLoginUrl) {
        const toastMessage = getKakaoLoginErrorMessage(KAKAO_LOGIN_START_ERROR);

        if (toastMessage) {
          showToast(toastMessage, 'error');
        }

        if (import.meta.env.DEV) {
          console.error(
            '카카오 로그인 URL 생성 실패: VITE_KAKAO_AUTH_URL 또는 VITE_KAKAO_REST_API_KEY / VITE_KAKAO_REDIRECT_URI를 확인하세요.'
          );
        }
      }

      return;
    }

    setIsKakaoLoginPending(true);
    window.location.href = kakaoLoginUrl;
  };

  return {
    isKakaoLoginPending,
    canStartKakaoLogin,
    handleKakaoLogin,
  };
};
