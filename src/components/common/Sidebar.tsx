import { useNavigate } from 'react-router-dom';
import { SidebarHeaderSection } from '@/components/common/sidebar/SidebarHeaderSection';
import { SidebarNavigationMenu } from '@/components/common/sidebar/SidebarNavigationMenu';
import { SidebarUserProfile } from '@/components/common/sidebar/SidebarUserProfile';
import { SidebarContainer } from '@/components/common/sidebar/sidebarStyles';
import { useAuth } from '@/hooks/useAuth';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';
import { NAVIGATION_BY_ROLE } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useUiStore } from '@/stores/uiStore';

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
