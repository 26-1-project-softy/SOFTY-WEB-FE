import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { useAdminLoginForm } from '@/features/auth/hooks/useAdminLoginForm';
import { Alert } from '@/components/common/Alert';
import { FooterCopyright } from '@/components/common/FooterCopyright';
import { IconButton } from '@/components/common/IconButton';
import { InlineButton } from '@/components/common/InlineButton';
import { TextField } from '@/components/common/TextField';
import { IcBack } from '@/icons';
import { ROUTES } from '@/constants/routes';

export const AdminLoginPage = () => {
  const navigate = useNavigate();

  const {
    loginId,
    password,
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
      <AdminLoginContent>
        <IconButton
          icon={IcBack}
          variant="plain"
          onClick={handleGoBack}
          accessibilityLabel="뒤로가기"
        />

        <AdminLoginCard>
          <AdminLoginForm onSubmit={handleSubmit}>
            <AdminLoginTitle>관리자 로그인</AdminLoginTitle>

            <AdminLoginInputSection>
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
            </AdminLoginInputSection>

            <AdminLoginActionSection>
              {loginError && (
                <Alert
                  title={loginError.title}
                  description={loginError.description}
                  variant="error"
                />
              )}

              <InlineButton
                type="submit"
                variant="primary"
                size="L"
                label="로그인"
                disabled={!isLoginEnabled}
              />
            </AdminLoginActionSection>
          </AdminLoginForm>
        </AdminLoginCard>
      </AdminLoginContent>

      <FooterCopyright />
    </AdminLoginPageContainer>
  );
};

const AdminLoginPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg2};
  padding: 32px 16px;
  gap: 80px;
`;

const AdminLoginContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const AdminLoginCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.background.bg1};
  border-radius: 16px;
  padding: 40px;
`;

const AdminLoginForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

const AdminLoginTitle = styled.h1`
  ${({ theme }) => theme.fonts.labelL};
  color: ${({ theme }) => theme.colors.text.text1};
  text-align: center;
`;

const AdminLoginInputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const AdminLoginActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
