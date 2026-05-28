import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconBadge } from '@/components/common/IconBadge';
import { SectionCard, SectionCardContent } from '@/components/common/SectionCard';
import { IcDefaultProfile } from '@/icons';

type ProfileInfoCardProps = {
  teacherName?: string;
};

export const ProfileInfoCard = ({ teacherName }: ProfileInfoCardProps) => {
  const theme = useTheme();
  const profileName = teacherName?.trim() ? teacherName : '-';

  return (
    <SectionCard title="프로필 정보">
      <SectionCardContent>
        <ProfileRow>
          <IconBadge
            size={48}
            iconSize={24}
            icon={IcDefaultProfile}
            bgColor={theme.colors.background.bg4}
            color={theme.colors.brand.dark}
          />
          <ProfileName>{profileName}</ProfileName>
        </ProfileRow>
      </SectionCardContent>
    </SectionCard>
  );
};

const ProfileRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProfileName = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;
