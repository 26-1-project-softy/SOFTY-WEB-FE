import styled from '@emotion/styled';
import type { AuthRole } from '@/stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';

// 테스트용 role 타입
type MockLoginRole = Exclude<AuthRole, null>;

export const LandingPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const handleMockLogin = (role: MockLoginRole) => {
    // TODO: 실제 로그인 구현 시 제거하고 API 연동 로직으로 교체
    // 인증 API 연동 전 라우트 가드, 레이아웃, Sidebar 표시를 확인하기 위한 개발용 mock 로그인
    setAuth({
      isAuthenticated: true,
      role,
      user:
        role === 'teacher'
          ? {
              name: '홍길동',
              grade: 3,
              classNumber: 2,
            }
          : {
              name: '관리자',
            },
    });

    navigate(getDefaultRouteByRole(role), { replace: true });
  };

  return (
    <LandingPageContainer title="랜딩 페이지">
      <Actions>
        <ActionButton type="button" onClick={() => handleMockLogin('teacher')}>
          교사 로그인
        </ActionButton>
        <ActionButton type="button" onClick={() => handleMockLogin('admin')}>
          관리자 로그인
        </ActionButton>
      </Actions>
    </LandingPageContainer>
  );
};

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;

const ActionButton = styled.button`
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  cursor: pointer;
`;
