import styled from '@emotion/styled';
import { Loader } from '@/components/common/Loader';
import { useTeacherKakaoCallback } from '@/features/auth/hooks/useTeacherKakaoCallback';

export const TeacherKakaoCallbackPage = () => {
  useTeacherKakaoCallback();

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
