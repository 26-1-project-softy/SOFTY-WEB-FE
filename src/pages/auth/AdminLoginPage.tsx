import styled from '@emotion/styled';
import { useMemo, useState } from 'react';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/api/auth/adminApi';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { authApi } from '@/services/auth/auth.api';
import { authSession } from '@/services/auth/authSession';
import { IcBack, IcInfo } from '@/icons';

type LoginErrorState = {
  title: string;
  description: string;
} | null;

const DEFAULT_LOGIN_ERROR: LoginErrorState = {
  title: '아이디 또는 비밀번호가 올바르지 않아요',
  description: '입력한 정보를 다시 확인해 주세요.',
};

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<LoginErrorState>(null);

  const isLoginEnabled = useMemo(() => {
    return !isSubmitting && loginId.trim().length > 0 && password.trim().length > 0;
  }, [isSubmitting, loginId, password]);

  const handleGoBack = () => {
    navigate(ROUTES.root);
  };

  const handleChangeLoginId = (value: string) => {
    setLoginId(value);
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleChangePassword = (value: string) => {
    setPassword(value);
    if (loginError) {
      setLoginError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isLoginEnabled) {
      return;
    }

    try {
      setIsSubmitting(true);
      setLoginError(null);

      const response = await adminApi.login({
        loginId: loginId.trim(),
        password: password.trim(),
      });

      if (!response.success) {
        setLoginError({
          title: response.message || DEFAULT_LOGIN_ERROR.title,
          description: DEFAULT_LOGIN_ERROR.description,
        });
        return;
      }

      authSession.setTokens({
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });

      const me = await authApi.getMe();
      setAuth({ isAuthenticated: true, role: me.role, user: me.user });

      navigate(me.role === 'admin' ? ROUTES.adminDashboard : ROUTES.inbox, {
        replace: true,
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const errorTitle = axiosError.response?.data?.message || DEFAULT_LOGIN_ERROR.title;

      authSession.clearTokens();
      setLoginError({
        title: errorTitle,
        description: DEFAULT_LOGIN_ERROR.description,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLoginPageContainer>
      <ContentArea>
        <BackButton type="button" onClick={handleGoBack} aria-label="뒤로가기">
          <IcBack />
        </BackButton>

        <LoginCard>
          <Title>관리자 로그인</Title>

          <LoginForm onSubmit={handleSubmit}>
            <InputGroup>
              <Label htmlFor="loginId">아이디</Label>
              <Input
                id="loginId"
                name="loginId"
                type="text"
                autoComplete="username"
                value={loginId}
                onChange={event => handleChangeLoginId(event.target.value)}
                placeholder="아이디를 입력해주세요."
              />
            </InputGroup>

            <InputGroup>
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={event => handleChangePassword(event.target.value)}
                placeholder="비밀번호를 입력해주세요."
              />
            </InputGroup>

            {loginError ? (
              <ErrorBox role="alert" aria-live="polite">
                <ErrorIconWrap>
                  <IcInfo />
                </ErrorIconWrap>
                <ErrorTextWrap>
                  <ErrorTitle>{loginError.title}</ErrorTitle>
                  <ErrorDescription>{loginError.description}</ErrorDescription>
                </ErrorTextWrap>
              </ErrorBox>
            ) : null}

            <LoginButton type="submit" disabled={!isLoginEnabled}>
              {isSubmitting ? '로그인 중...' : '로그인'}
            </LoginButton>
          </LoginForm>
        </LoginCard>
      </ContentArea>

      <FooterText>© 2026, 소프티 All rights reserved.</FooterText>
    </AdminLoginPageContainer>
  );
};

const AdminLoginPageContainer = styled.div`
  min-height: 100vh;
  background: #e5e5e5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px 32px;
`;

const ContentArea = styled.div`
  width: 100%;
  max-width: 620px;
`;

const BackButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: ${({ theme }) => theme.colors.text.text1};

  svg {
    width: 22px;
    height: 22px;
  }
`;

const LoginCard = styled.div`
  margin-top: 18px;
  width: 100%;
  max-width: 540px;
  background: #f4f4f4;
  border-radius: 18px;
  box-shadow: 0 12px 22px rgba(0, 0, 0, 0.12);
  padding: 44px 48px 42px;

  @media (max-width: 640px) {
    padding: 30px 18px 24px;
  }
`;

const Title = styled.h1`
  ${({ theme }) => theme.fonts.title2};
  color: ${({ theme }) => theme.colors.text.text1};
  margin: 0;
  text-align: center;
`;

const LoginForm = styled.form`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Label = styled.label`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Input = styled.input`
  ${({ theme }) => theme.fonts.labelS};
  border: 1px solid #c6c6c6;
  border-radius: 12px;
  background: #f4f4f4;
  padding: 13px 14px;
  color: ${({ theme }) => theme.colors.text.text1};

  &::placeholder {
    color: #8d8d8d;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.brand.primary};
    box-shadow: 0 0 0 2px rgba(85, 181, 166, 0.16);
  }
`;

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  border-radius: 18px;
  border: 1px solid #ff5b66;
  background: #ffe9ec;
  padding: 14px 16px;
`;

const ErrorIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ErrorTextWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const ErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const ErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const LoginButton = styled.button`
  ${({ theme }) => theme.fonts.labelS};
  margin-top: 18px;
  border: none;
  border-radius: 14px;
  padding: 14px;
  color: ${({ theme }) => theme.colors.text.textW};
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: background 0.2s ease;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.background.brandHover};
  }

  &:disabled {
    background: #d0d0d0;
    color: #747474;
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 64px 0 0;
  color: #919191;
`;
