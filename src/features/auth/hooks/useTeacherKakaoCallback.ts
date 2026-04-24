import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authApi, authSession, teacherAuthApi } from '@/services/auth';
import { useToastStore } from '@/stores/toastStore';
import { ROUTES } from '@/constants/routes';
import { getKakaoLoginErrorMessage } from '@/features/auth/lib/getKakaoLoginErrorMessage';

const KAKAO_LOGIN_ERROR_MESSAGE = '카카오 로그인에 실패했어요. 잠시 후 다시 시도해 주세요.';

const getKakaoCodeFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);

  return searchParams.get('code') || '';
};

const getKakaoErrorFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);

  return searchParams.get('error') || '';
};

const getKakaoErrorDescriptionFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);

  return searchParams.get('error_description') || '';
};

export const useTeacherKakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSignupRequired, setSignedIn, setSignedOut } = useAuth();
  const showToast = useToastStore(state => state.showToast);
  const isHandledRef = useRef(false);

  useEffect(() => {
    const handleKakaoLogin = async () => {
      if (isHandledRef.current) {
        return;
      }

      isHandledRef.current = true;

      try {
        const kakaoError = getKakaoErrorFromQuery(location.search);
        const kakaoErrorDescription = getKakaoErrorDescriptionFromQuery(location.search);

        if (kakaoError) {
          const toastMessage = getKakaoLoginErrorMessage(
            new Error(kakaoErrorDescription || kakaoError)
          );

          if (toastMessage) {
            showToast(toastMessage, 'error');
          }

          navigate(ROUTES.root, { replace: true });
          return;
        }

        const code = getKakaoCodeFromQuery(location.search);
        const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined;

        if (!code || !redirectUri) {
          const toastMessage = getKakaoLoginErrorMessage(new Error(KAKAO_LOGIN_ERROR_MESSAGE));

          if (toastMessage) {
            showToast(toastMessage, 'error');
          }

          navigate(ROUTES.root, { replace: true });
          return;
        }

        const response = await teacherAuthApi.loginWithKakao({
          code,
          redirectUri,
        });

        if (!response.success || !response.data?.accessToken || !response.data?.refreshToken) {
          const toastMessage = getKakaoLoginErrorMessage(
            new Error(response.message || KAKAO_LOGIN_ERROR_MESSAGE)
          );

          if (toastMessage) {
            showToast(toastMessage, 'error');
          }

          authSession.clearSession();
          setSignedOut();
          navigate(ROUTES.root, { replace: true });
          return;
        }

        authSession.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        if (response.data.registrationRequired) {
          authSession.setAuthStatus('SIGNUP_REQUIRED');
          setSignupRequired();
          navigate(ROUTES.teacherSignUp, { replace: true });
          return;
        }

        const me = await authApi.getMe();

        authSession.setAuthStatus('SIGNED_IN');
        setSignedIn({
          role: me.role,
          user: me.user,
        });

        navigate(ROUTES.teacherThreadList, { replace: true });
      } catch (error) {
        authSession.clearSession();
        setSignedOut();

        const toastMessage = getKakaoLoginErrorMessage(error);

        if (toastMessage) {
          showToast(toastMessage, 'error');
        }

        if (import.meta.env.DEV) {
          console.error('카카오 로그인 실패', error);
        }

        navigate(ROUTES.root, { replace: true });
      }
    };

    void handleKakaoLogin();
  }, [location.search, navigate, setSignedIn, setSignedOut, setSignupRequired, showToast]);
};
