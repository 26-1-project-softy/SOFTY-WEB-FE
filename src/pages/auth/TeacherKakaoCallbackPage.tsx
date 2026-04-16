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

const getKakaoCodeFromQuery = (search: string) => {
  const searchParams = new URLSearchParams(search);
  return searchParams.get('code') || '';
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
      const kakaoCode = getKakaoCodeFromQuery(location.search);

      if (!kakaoCode) {
        moveToLandingWithError(navigate, '카카오 로그인에 실패했어요.');
        return;
      }

      try {
        const response = await kakaoApi.login({ code: kakaoCode });

        if (!response.success) {
          moveToLandingWithError(navigate, response.message || '카카오 로그인에 실패했어요.');
          return;
        }

        authSession.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });

        if (response.data.registrationRequired) {
          navigate(ROUTES.teacherSignUp, { replace: true });
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
