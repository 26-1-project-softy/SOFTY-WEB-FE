import styled from '@emotion/styled';
import { IcBrandLogo } from '@/icons';

type SidebarHeaderSectionProps = {
  isOpen: boolean;
  onBrandClick: () => void;
  onToggleClick: () => void;
};

export const SidebarHeaderSection = ({
  isOpen,
  onBrandClick,
  onToggleClick,
}: SidebarHeaderSectionProps) => {
  return (
    <SidebarHeader>
      <SidebarBrandButton
        type="button"
        onClick={onBrandClick}
        isOpen={isOpen}
        aria-label={'\uD648\uC73C\uB85C \uC774\uB3D9'}
      >
        <IcBrandLogo />
        <BrandLabelSlot isOpen={isOpen}>
          <BrandLabel isOpen={isOpen}>SOFTY</BrandLabel>
        </BrandLabelSlot>
      </SidebarBrandButton>

      <SidebarToggleButton
        type="button"
        onClick={onToggleClick}
        aria-label={isOpen ? '\uBA54\uB274 \uB2EB\uAE30' : '\uBA54\uB274 \uC5F4\uAE30'}
        aria-expanded={isOpen}
      >
        <SidebarToggleLine isOpen={isOpen} />
        <SidebarToggleLine isOpen={isOpen} />
        <SidebarToggleLine isOpen={isOpen} />
      </SidebarToggleButton>
    </SidebarHeader>
  );
};

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
