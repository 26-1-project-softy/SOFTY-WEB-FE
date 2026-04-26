import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { authSession } from '@/services/auth';
import { useToastStore } from '@/stores/toastStore';
import { ROUTES } from '@/constants/routes';
import { getKakaoLoginErrorMessage } from '@/features/auth/lib/getKakaoLoginErrorMessage';
import { parseKakaoCallbackQuery } from '@/features/auth/lib/parseKakaoCallbackQuery';
import { processTeacherKakaoCallback } from '@/features/auth/lib/processTeacherKakaoCallback';

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
        const { code, error, errorDescription } = parseKakaoCallbackQuery(location.search);

        if (error) {
          const toastMessage = getKakaoLoginErrorMessage(new Error(errorDescription || error));

          if (toastMessage) {
            showToast(toastMessage, 'error');
          }

          navigate(ROUTES.root, { replace: true });
          return;
        }

        const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined;

        const result = await processTeacherKakaoCallback({
          code,
          redirectUri,
        });

        if (result.status === 'error') {
          authSession.clearSession();
          setSignedOut();
          showToast(result.message, 'error');
          navigate(ROUTES.root, { replace: true });
          return;
        }

        if (result.status === 'signup_required') {
          authSession.setTokens({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
          authSession.setAuthStatus('SIGNUP_REQUIRED');

          setSignupRequired();
          navigate(ROUTES.teacherSignUp, { replace: true });
          return;
        }

        authSession.setTokens({
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
        authSession.setAuthStatus('SIGNED_IN');

        setSignedIn({
          role: result.role,
          user: result.user,
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
