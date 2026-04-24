import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
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
