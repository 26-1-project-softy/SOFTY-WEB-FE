import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Avatar } from '@/components/common/Avatar';
import { IconBadge } from '@/components/common/IconBadge';
import { StatusTagButton } from '@/components/teacher/threadDetail/StatusTagButton';
import type { ThreadRoomItem } from '@/features/teacher/threadList/types';
import type { ThreadStatus } from '@/stores/threadStatusStore';
import { INQUIRY_INTENT_COLOR_KEY, type InquiryIntentType } from '@/constants/inquiryIntent';
import { INQUIRY_STATUS_LABEL } from '@/constants/inquiryStatus';
import {
  formatUserDisplayName,
  formatUserDisplayNameWithSuffix,
  isUnknownUserDisplayName,
} from '@/utils/formatUserDisplayName';
import { IcDefaultProfile } from '@/icons';

type ThreadCardProps = {
  room: ThreadRoomItem;
  currentStatus: ThreadStatus;
  onClick: () => void;
};

export const ThreadCard = ({ room, currentStatus, onClick }: ThreadCardProps) => {
  const theme = useTheme();

  const counterpartName = formatUserDisplayName(room.counterpartName);
  const isUnknownCounterpart = isUnknownUserDisplayName(counterpartName);

  const counterpartDisplayName = formatUserDisplayNameWithSuffix({
    name: room.counterpartName,
    suffix: '학부모님',
  });

  const studentDisplayName = formatUserDisplayNameWithSuffix({
    name: room.studentName,
    suffix: '학생',
  });

  return (
    <ThreadCardContainer type="button" onClick={onClick}>
      <ThreadBodyArea>
        {isUnknownCounterpart ? (
          <IconBadge
            size={48}
            iconSize={24}
            icon={IcDefaultProfile}
            bgColor={theme.colors.background.bg4}
            color={theme.colors.brand.dark}
          />
        ) : (
          <Avatar size={48} lastName={counterpartName.charAt(0)} />
        )}

        <ThreadContentArea>
          <NameGroup>
            <ParentName>{counterpartDisplayName}</ParentName>
            <StudentName>{studentDisplayName}</StudentName>
          </NameGroup>

          <PreviewText>{room.preview}</PreviewText>

          <TagGroup>
            <IntentTag $intentType={room.intentTag.type}>{room.intentTag.label}</IntentTag>
            <StatusTagButton label={INQUIRY_STATUS_LABEL[currentStatus]} status={currentStatus} />
          </TagGroup>
        </ThreadContentArea>
      </ThreadBodyArea>

      <ThreadMetaArea>
        <TimeText>{room.timeText}</TimeText>
        {room.unreadCount > 0 ? <UnreadBadge>{room.unreadCount}</UnreadBadge> : null}
      </ThreadMetaArea>
    </ThreadCardContainer>
  );
};

const ThreadCardContainer = styled.button`
  display: flex;
  width: 100%;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  text-align: left;
`;

const ThreadBodyArea = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  gap: 18px;
`;

const ThreadContentArea = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 10px;
`;

const NameGroup = styled.div`
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
`;

const ParentName = styled.span`
  ${({ theme }) => theme.fonts.labelS};
  flex-shrink: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.body2};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.colors.text.text3};
`;

const PreviewText = styled.p`
  ${({ theme }) => theme.fonts.body2};
  overflow: hidden;
  color: ${({ theme }) => theme.colors.text.text4};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TagGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const IntentTag = styled.span<{ $intentType: InquiryIntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  border-radius: 50px;
  padding: 4px 10px;

  ${({ $intentType, theme }) => {
    const colorKey = INQUIRY_INTENT_COLOR_KEY[$intentType];
    const color = theme.colors.intent[colorKey];

    return `
      border: 1px solid ${color.border};
      color: ${color.text};
      background: ${color.background};
    `;
  }}
`;

const ThreadMetaArea = styled.div`
  display: flex;
  flex-shrink: 0;
  min-width: 72px;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
`;

const TimeText = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const UnreadBadge = styled.span`
  ${({ theme }) => theme.fonts.body3};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.brand.primary};
  color: ${({ theme }) => theme.colors.text.textW};
`;
