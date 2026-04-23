import { useMemo, useState } from 'react';
import { useToastStore } from '@/stores/toastStore';
import { getKakaoLoginStartUrl } from '@/features/auth/lib/getKakaoLoginStartUrl';
import { getKakaoLoginErrorMessage } from '@/features/auth/lib/getKakaoLoginErrorMessage';

const KAKAO_LOGIN_ERROR_MESSAGE = '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';

export const useTeacherKakaoLogin = () => {
  const [isKakaoLoginLoading, setIsKakaoLoginLoading] = useState(false);
  const showToast = useToastStore(state => state.showToast);

  const kakaoLoginUrl = useMemo(() => getKakaoLoginStartUrl(), []);

  const handleKakaoLogin = () => {
    if (isKakaoLoginLoading) {
      return;
    }

    if (!kakaoLoginUrl) {
      const toastMessage = getKakaoLoginErrorMessage(new Error(KAKAO_LOGIN_ERROR_MESSAGE));

      if (toastMessage) {
        showToast(toastMessage, 'error');
      }

      if (import.meta.env.DEV) {
        console.error(
          '카카오 로그인 URL 생성 실패: VITE_KAKAO_AUTH_URL 또는 VITE_KAKAO_REST_API_KEY / VITE_KAKAO_REDIRECT_URI를 확인하세요.'
        );
      }

      return;
    }

    setIsKakaoLoginLoading(true);
    window.location.href = kakaoLoginUrl;
  };

  return {
    isKakaoLoginLoading,
    handleKakaoLogin,
  };
};
