import styled from '@emotion/styled';
import { useTeacherSignUpForm } from '@/features/auth/hooks/useTeacherSignUpForm';
import { TeacherSignUpForm } from '@/features/auth/components/TeacherSignUpForm';
import { IconButton } from '@/components/common/IconButton';
import { IcLogout } from '@/icons';

export const TeacherSignUpPage = () => {
  const { step, handleLogout, ...teacherSignUpFormProps } = useTeacherSignUpForm();

  return (
    <TeacherSignUpPageContainer>
      <TeacherSignUpContent>
        {step === 'FORM' ? (
          <IconButton
            icon={IcLogout}
            variant="plain"
            onClick={handleLogout}
            accessibilityLabel="로그아웃"
          />
        ) : null}

        <TeacherSignUpForm step={step} {...teacherSignUpFormProps} />
      </TeacherSignUpContent>

      <FooterText>© 2026, 소프티 All rights reserved.</FooterText>
    </TeacherSignUpPageContainer>
  );
};

const TeacherSignUpPageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  gap: 60px;
`;

const TeacherSignUpContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FooterText = styled.p`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.neutral.neutral500};
`;
