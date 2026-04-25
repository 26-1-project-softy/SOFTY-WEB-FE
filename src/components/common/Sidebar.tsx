import styled from '@emotion/styled';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { IconBadge } from '@/components/common/IconBadge';
import { getDefaultRouteByRole } from '@/utils/getDefaultRouteByRole';
import { NAVIGATION_BY_ROLE } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useUiStore } from '@/stores/uiStore';
import { IcBrandLogo, IcDefaultProfile } from '@/icons';

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
      <SidebarHeader>
        <SidebarBrandButton
          type="button"
          onClick={handleClickBrand}
          isOpen={isSidebarOpen}
          aria-label="홈으로 이동"
        >
          <IcBrandLogo />
          <BrandLabelSlot isOpen={isSidebarOpen}>
            <BrandLabel isOpen={isSidebarOpen}>소프티</BrandLabel>
          </BrandLabelSlot>
        </SidebarBrandButton>

        <SidebarToggleButton
          type="button"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
          aria-expanded={isSidebarOpen}
        >
          <SidebarToggleLine isOpen={isSidebarOpen} />
          <SidebarToggleLine isOpen={isSidebarOpen} />
          <SidebarToggleLine isOpen={isSidebarOpen} />
        </SidebarToggleButton>
      </SidebarHeader>
      <SidebarNavigation>
        {items.map(item => {
          const Icon = item.icon;

          return (
            <MenuLInk
              key={item.path}
              to={item.path}
              isOpen={isSidebarOpen}
              aria-label={item.label}
              title={!isSidebarOpen ? item.label : undefined}
            >
              <Icon />
              <MenuLabelSlot isOpen={isSidebarOpen}>
                <MenuLabel isOpen={isSidebarOpen}>{item.label}</MenuLabel>
              </MenuLabelSlot>
            </MenuLInk>
          );
        })}
      </SidebarNavigation>
      <SidebarProfileSection isOpen={isSidebarOpen}>
        <IconBadge icon={IcDefaultProfile} bgColor="#F2FDFA" color="#35746E" />
        <ProfileSummarySlot isOpen={isSidebarOpen}>
          <ProfileSummary isOpen={isSidebarOpen}>
            <ProfileName>{userName}</ProfileName>
            {userMeta && <ProfileMeta>{userMeta}</ProfileMeta>}
          </ProfileSummary>
        </ProfileSummarySlot>
        {/* TODO: 로그아웃 버튼 */}
      </SidebarProfileSection>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
  width: ${({ isOpen }) => (isOpen ? '240px' : '100px')};
  min-height: 100vh;
  height: auto;
  align-self: stretch;
  background: ${({ theme }) => theme.colors.background.bg1};
  border-right: 1px solid ${({ theme }) => theme.colors.border.border2};
  gap: 10px;
  transition: width 0.3s ease;
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border2};
  padding: 16px 12px;
  gap: 10px;
`;

const SidebarBrandButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ isOpen }) => (isOpen ? '16px' : 0)};
`;

const BrandLabelSlot = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  min-width: 0;
  overflow: hidden;
  max-width: ${({ isOpen }) => (isOpen ? '120px' : '0')};
  transition: max-width 0.28s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '0ms' : '90ms')};
`;

const BrandLabel = styled.span<{ isOpen: boolean }>`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.brand.primary};
  white-space: nowrap;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-4px)')};
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '120ms' : '0ms')};
`;

const SidebarToggleButton = styled.button`
  position: relative;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  width: 30px;
  height: 30px;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SidebarToggleLine = styled.span<{ isOpen: boolean }>`
  position: absolute;
  left: 50%;
  display: block;
  width: 16px;
  height: 2px;
  background: currentColor;
  transition: all 0.3s ease-in-out;
  transform-origin: center;
  margin-left: -8px;

  &:nth-of-type(1) {
    top: 9px;
    ${({ isOpen }) => isOpen && 'top: 14px; transform: rotate(45deg);'}
  }

  &:nth-of-type(2) {
    top: 14px;
    ${({ isOpen }) => isOpen && 'opacity: 0;'}
  }

  &:nth-of-type(3) {
    top: 19px;
    ${({ isOpen }) => isOpen && 'top: 14px; transform: rotate(-45deg);'}
  }
`;

const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0 16px;
  gap: 8px;
`;

const MenuLInk = styled(NavLink, {
  shouldForwardProp: prop => prop !== 'isOpen',
})<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  overflow: hidden;
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text4};
  border-radius: 10px;
  padding: 10px 16px;
  gap: ${({ isOpen }) => (isOpen ? '16px' : 0)};

  &:not(.active):hover {
    background: ${({ theme }) => theme.colors.background.bg3};
    color: ${({ theme }) => theme.colors.text.text1};
  }

  &.active {
    background: ${({ theme }) => theme.colors.background.bg4};
    color: ${({ theme }) => theme.colors.brand.dark};
  }

  svg {
    flex-shrink: 0;
  }
`;

const MenuLabelSlot = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  min-width: 0;
  overflow: hidden;
  max-width: ${({ isOpen }) => (isOpen ? '120px' : '0')};
  transition: max-width 0.28s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '0ms' : '90ms')};
`;

const MenuLabel = styled.span<{ isOpen: boolean }>`
  white-space: nowrap;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-4px)')};
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '120ms' : '0ms')};
`;

const SidebarProfileSection = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.border.border2};
  padding: 20px 16px;
  gap: ${({ isOpen }) => (isOpen ? '10px' : 0)};
`;

const ProfileSummarySlot = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  justify-content: center;
  overflow: hidden;
  max-width: ${({ isOpen }) => (isOpen ? '140px' : '0')};
  transition: max-width 0.28s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '0ms' : '90ms')};
`;

const ProfileSummary = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  color: ${({ theme }) => theme.colors.text.text1};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-4px)')};
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '120ms' : '0ms')};
`;

const ProfileName = styled.span`
  ${({ theme }) => theme.fonts.body2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ProfileMeta = styled.span`
  ${({ theme }) => theme.fonts.caption};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
