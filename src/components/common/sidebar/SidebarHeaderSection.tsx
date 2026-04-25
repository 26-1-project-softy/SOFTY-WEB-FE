import { IcBrandLogo } from '@/icons';
import {
  BrandLabel,
  BrandLabelSlot,
  SidebarBrandButton,
  SidebarHeader,
  SidebarToggleButton,
  SidebarToggleLine,
} from '@/components/common/sidebar/sidebarStyles';

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
        aria-label="홈으로 이동"
      >
        <IcBrandLogo />
        <BrandLabelSlot isOpen={isOpen}>
          <BrandLabel isOpen={isOpen}>소프티</BrandLabel>
        </BrandLabelSlot>
      </SidebarBrandButton>

      <SidebarToggleButton
        type="button"
        onClick={onToggleClick}
        aria-label={isOpen ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={isOpen}
      >
        <SidebarToggleLine isOpen={isOpen} />
        <SidebarToggleLine isOpen={isOpen} />
        <SidebarToggleLine isOpen={isOpen} />
      </SidebarToggleButton>
    </SidebarHeader>
  );
};
