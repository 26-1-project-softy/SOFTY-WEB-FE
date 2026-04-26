import styled from '@emotion/styled';
import { NavLink } from 'react-router-dom';

export const SidebarContainer = styled.aside<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
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

export const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 62px;
  padding: 12px 16px;
  gap: 10px;
`;

export const SidebarBrandButton = styled.button<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ isOpen }) => (isOpen ? '16px' : 0)};
`;

export const BrandLabelSlot = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  min-width: 0;
  overflow: hidden;
  max-width: ${({ isOpen }) => (isOpen ? '120px' : '0')};
  transition: max-width 0.28s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '0ms' : '90ms')};
`;

export const BrandLabel = styled.span<{ isOpen: boolean }>`
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

export const SidebarToggleButton = styled.button`
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

export const SidebarToggleLine = styled.span<{ isOpen: boolean }>`
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

export const SidebarNavigation = styled.nav`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0 16px;
  gap: 8px;
`;

export const MenuLink = styled(NavLink, {
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

export const MenuLabelSlot = styled.span<{ isOpen: boolean }>`
  display: inline-flex;
  min-width: 0;
  overflow: hidden;
  max-width: ${({ isOpen }) => (isOpen ? '120px' : '0')};
  transition: max-width 0.28s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '0ms' : '90ms')};
`;

export const MenuLabel = styled.span<{ isOpen: boolean }>`
  white-space: nowrap;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(-4px)')};
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transition-delay: ${({ isOpen }) => (isOpen ? '120ms' : '0ms')};
`;

export const SidebarProfileContainer = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ isOpen }) => (isOpen ? 'flex-start' : 'center')};
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.border.border2};
  padding: 20px 16px;
  gap: ${({ isOpen }) => (isOpen ? '10px' : 0)};
`;

export const ProfileSummarySlot = styled.div<{ isOpen: boolean }>`
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

export const ProfileSummary = styled.div<{ isOpen: boolean }>`
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

export const ProfileName = styled.span`
  ${({ theme }) => theme.fonts.body2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ProfileMeta = styled.span`
  ${({ theme }) => theme.fonts.caption};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
