import type { NavigationItem } from '@/constants/navigation';
import {
  MenuLabel,
  MenuLabelSlot,
  MenuLink,
  SidebarNavigation,
} from '@/components/common/sidebar/sidebarStyles';

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
