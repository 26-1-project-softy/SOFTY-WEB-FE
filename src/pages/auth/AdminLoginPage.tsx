import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { TextField } from '@/components/common/TextField';
import { ROUTES } from '@/constants/routes';
import { IcBack, IcInfo } from '@/icons';
import { useAdminLoginForm } from '@/features/auth/hooks/useAdminLoginForm';

export const AdminLoginPage = () => {
  const navigate = useNavigate();

  const {
    loginId,
    password,
    isSubmitting,
    loginError,
    isLoginEnabled,
    handleChangeLoginId,
    handleChangePassword,
    handleSubmit,
  } = useAdminLoginForm();

  const handleGoBack = () => {
    navigate(ROUTES.root);
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
            <TextField
              id="loginId"
              name="loginId"
              type="text"
              autoComplete="username"
              label="아이디"
              value={loginId}
              onChange={event => handleChangeLoginId(event.target.value)}
              placeholder="아이디를 입력해주세요."
            />

            <TextField
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              label="비밀번호"
              value={password}
              onChange={event => handleChangePassword(event.target.value)}
              placeholder="비밀번호를 입력해주세요."
            />

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
  background: ${({ theme }) => theme.colors.background.bg5};
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
  background: ${({ theme }) => theme.colors.background.bg3};
  border-radius: 18px;
  box-shadow: 0 12px 22px ${({ theme }) => `${theme.colors.neutral.neutral1100}1f`};
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

const ErrorBox = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error};
  background: ${({ theme }) => theme.colors.semantic.errorSoft};
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
    background: ${({ theme }) => theme.colors.neutral.neutral300};
    color: ${({ theme }) => theme.colors.neutral.neutral600};
    cursor: not-allowed;
  }
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  margin: 64px 0 0;
  color: ${({ theme }) => theme.colors.text.text4};
`;
