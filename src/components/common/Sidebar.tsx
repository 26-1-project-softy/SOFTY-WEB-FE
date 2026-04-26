import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { SidebarHeaderSection } from '@/components/common/sidebar/SidebarHeaderSection';
import { SidebarNavigationMenu } from '@/components/common/sidebar/SidebarNavigationMenu';
import { SidebarUserProfile } from '@/components/common/sidebar/SidebarUserProfile';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import { NAVIGATION_BY_ROLE } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { useUiStore } from '@/stores/uiStore';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';

export const Sidebar = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const isSidebarOpen = useUiStore(state => state.isSidebarOpen);
  const toggleSidebar = useUiStore(state => state.toggleSidebar);

  const items = role ? NAVIGATION_BY_ROLE[role] : [];
  const userName = user?.name ?? '사용자';
  const userMeta =
    role === 'teacher' && user?.grade && user?.classNumber
      ? `${user.grade}학년 ${user.classNumber}반`
      : '';

  const handleClickBrand = () => {
    if (!role) {
      navigate(ROUTES.root, { replace: true });
      return;
    }

    navigate(getDefaultRouteByRole(role), { replace: true });
  };

  return (
    <SidebarContainer isOpen={isSidebarOpen}>
      <SidebarHeaderSection
        isOpen={isSidebarOpen}
        onBrandClick={handleClickBrand}
        onToggleClick={toggleSidebar}
      />

      <SidebarNavigationMenu isOpen={isSidebarOpen} items={items} />

      <SidebarUserProfile isOpen={isSidebarOpen} userName={userName} userMeta={userMeta} />
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  width: ${({ isOpen }) => (isOpen ? `${SIDEBAR_WIDTH.open}px` : `${SIDEBAR_WIDTH.closed}px`)};
  height: 100vh;
  background: ${({ theme }) => theme.colors.background.bg1};
  border-right: 1px solid ${({ theme }) => theme.colors.border.border2};
  gap: 10px;
  transition: width 0.3s ease;
`;
