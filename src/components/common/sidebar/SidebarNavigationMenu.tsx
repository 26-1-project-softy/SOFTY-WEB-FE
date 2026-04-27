import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';
import type { NavigationItem } from '@/constants/navigation';

type SidebarNavigationMenuProps = {
  isOpen: boolean;
  items: NavigationItem[];
};

export const SidebarNavigationMenu = ({ isOpen, items }: SidebarNavigationMenuProps) => {
  return (
    <SidebarNavigation>
      {items.map(item => {
        const Icon = item.icon;

        return (
          <MenuLink
            key={item.path}
            to={item.path}
            isOpen={isOpen}
            aria-label={item.label}
            title={!isOpen ? item.label : undefined}
          >
            <Icon />
            <MenuLabelSlot isOpen={isOpen}>
              <MenuLabel isOpen={isOpen}>{item.label}</MenuLabel>
            </MenuLabelSlot>
          </MenuLink>
        );
      })}
    </SidebarNavigation>
  );
};

const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0 16px;
  gap: 8px;
`;

const MenuLink = styled(NavLink, {
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
