import { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import { useLocation, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from '@/components/common/Loader';
import { kakaoApi } from '@/api/auth/kakaoApi';
import { AxiosError } from 'axios';
import { authApi } from '@/services/auth/auth.api';
import { authSession } from '@/services/auth/authSession';

const getKakaoAccessTokenFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);

  return (
    searchParams.get('kakaoAccessToken') ||
    searchParams.get('accessToken') ||
    searchParams.get('token') ||
    ''
  );
};

const getKakaoCodeFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);
  return searchParams.get('code') || '';
};

const exchangeKakaoCodeForAccessToken = async (code: string) => {
  const clientId =
    (import.meta.env.VITE_KAKAO_REST_API_KEY as string | undefined) ||
    (import.meta.env.VITE_KAKAO_JS_KEY as string | undefined);
  const redirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI as string | undefined;

  if (!clientId || !redirectUri) {
    throw new Error('카카오 로그인 설정을 확인해주세요.');
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: clientId,
    redirect_uri: redirectUri,
    code,
  });

  const response = await fetch('https://kauth.kakao.com/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('카카오 인증 코드를 토큰으로 교환하지 못했어요.');
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('카카오 액세스 토큰이 응답에 없어요.');
  }

  return data.access_token;
};

const moveToLandingWithError = (navigate: ReturnType<typeof useNavigate>, message: string) => {
  navigate(`${ROUTES.root}?kakaoLoginError=${encodeURIComponent(message)}`, { replace: true });
};

export const TeacherKakaoCallbackPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();
  const isHandledRef = useRef(false);

  useEffect(() => {
    const handleKakaoLogin = async () => {
      if (isHandledRef.current) {
        return;
      }

      isHandledRef.current = true;

      try {
        let kakaoAccessToken = getKakaoAccessTokenFromQuery(location.search);
        const kakaoCode = getKakaoCodeFromQuery(location.search);

        if (!kakaoAccessToken && kakaoCode) {
          kakaoAccessToken = await exchangeKakaoCodeForAccessToken(kakaoCode);
        }

        if (!kakaoAccessToken) {
          moveToLandingWithError(navigate, '카카오 로그인에 실패했어요.');
          return;
        }

        const response = await kakaoApi.login({ kakaoAccessToken });

        if (!response.success) {
          moveToLandingWithError(navigate, response.message || '카카오 로그인에 실패했어요.');
          return;
        }

        authSession.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        if (response.data.registrationRequired) {
          navigate(
            `${ROUTES.teacherSignUp}?kakaoAccessToken=${encodeURIComponent(kakaoAccessToken)}`,
            {
              replace: true,
            }
          );
          return;
        }

        const me = await authApi.getMe();

        setAuth({ isAuthenticated: true, role: me.role, user: me.user });

        navigate(me.role === 'teacher' ? ROUTES.inbox : ROUTES.adminDashboard, {
          replace: true,
        });
      } catch (error) {
        const axiosError = error as AxiosError<{ message?: string }>;
        const errorMessage = axiosError.response?.data?.message || '카카오 로그인에 실패했어요.';
        authSession.clearTokens();
        moveToLandingWithError(navigate, errorMessage);
      }
    };

    void handleKakaoLogin();
  }, [location.search, navigate, setAuth]);

  return (
    <CallbackPageContainer>
      <Loader />
    </CallbackPageContainer>
  );
};

const CallbackPageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 24px;
`;
