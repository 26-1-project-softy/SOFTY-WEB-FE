import { IconBadge } from '@/components/common/IconBadge';
import { IcDefaultProfile } from '@/icons';
import {
  ProfileMeta,
  ProfileName,
  ProfileSummary,
  ProfileSummarySlot,
  SidebarProfileContainer,
} from '@/components/common/sidebar/sidebarStyles';

type SidebarUserProfileProps = {
  isOpen: boolean;
  userName: string;
  userMeta: string;
};

export const SidebarUserProfile = ({ isOpen, userName, userMeta }: SidebarUserProfileProps) => {
  return (
    <SidebarProfileContainer isOpen={isOpen}>
      <IconBadge
          icon={IcDefaultProfile}
          size={36}
          iconSize={24}
          bgColor={theme.colors.background.bg4}
          color={theme.colors.brand.dark}
        />
      <ProfileSummarySlot isOpen={isOpen}>
        <ProfileSummary isOpen={isOpen}>
          <ProfileName>{userName}</ProfileName>
          {userMeta ? <ProfileMeta>{userMeta}</ProfileMeta> : null}
        </ProfileSummary>
      </ProfileSummarySlot>
    </SidebarProfileContainer>
  );
};
