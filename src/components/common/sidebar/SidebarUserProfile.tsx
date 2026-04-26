import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
import { IconBadge } from '@/components/common/IconBadge';
import { IcDefaultProfile } from '@/icons';

type SidebarUserProfileProps = {
  isOpen: boolean;
  userName: string;
  userMeta: string;
};

export const SidebarUserProfile = ({ isOpen, userName, userMeta }: SidebarUserProfileProps) => {
  const theme = useTheme();

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

const SidebarProfileContainer = styled.div<{ isOpen: boolean }>`
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
