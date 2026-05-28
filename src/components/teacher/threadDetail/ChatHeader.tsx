import styled from '@emotion/styled';
import { Header } from '@/components/common/Header';
import { InlineButton } from '@/components/common/InlineButton';
import { StatusTagButton } from '@/components/teacher/threadDetail/StatusTagButton';
import {
  INQUIRY_INTENT_COLOR_KEY,
  INQUIRY_INTENT_LABEL,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';
import { INQUIRY_STATUS, INQUIRY_STATUS_LABEL } from '@/constants/inquiryStatus';
import type { ThreadStatus } from '@/stores/threadStatusStore';
import { formatUserDisplayNameWithSuffix } from '@/utils/formatUserDisplayName';

type ChatHeaderProps = {
  counterpartName: string;
  studentName: string;
  intentType: InquiryIntentType;
  status: ThreadStatus;
  isStatusMenuOpen: boolean;
  onBack: () => void;
  onToggleStatusMenu: () => void;
  onSelectStatus: (status: ThreadStatus) => void;
};

export const ChatHeader = ({
  counterpartName,
  studentName,
  intentType,
  status,
  isStatusMenuOpen,
  onBack,
  onToggleStatusMenu,
  onSelectStatus,
}: ChatHeaderProps) => {
  const counterpartDisplayName = formatUserDisplayNameWithSuffix({
    name: counterpartName,
    suffix: '학부모님',
  });

  const studentDisplayName = formatUserDisplayNameWithSuffix({
    name: studentName,
    suffix: '학생',
  });

  return (
    <Header
      title={counterpartDisplayName}
      onBack={onBack}
      metaData={
        <ChatHeaderMetaArea>
          <StudentName>{studentDisplayName}</StudentName>

          <IntentTag $intentType={intentType}>{INQUIRY_INTENT_LABEL[intentType]}</IntentTag>

          <StatusDropdownArea>
            <StatusTagButton
              label={INQUIRY_STATUS_LABEL[status]}
              status={status}
              isDropdown
              onClick={onToggleStatusMenu}
            />

            {isStatusMenuOpen ? (
              <StatusMenu>
                <StatusMenuItem
                  variant="text"
                  size="M"
                  label={INQUIRY_STATUS_LABEL.IN_PROGRESS}
                  onClick={() => onSelectStatus(INQUIRY_STATUS.IN_PROGRESS)}
                />
                <StatusMenuItem
                  variant="text"
                  size="M"
                  label={INQUIRY_STATUS_LABEL.COMPLETED}
                  onClick={() => onSelectStatus(INQUIRY_STATUS.COMPLETED)}
                />
              </StatusMenu>
            ) : null}
          </StatusDropdownArea>
        </ChatHeaderMetaArea>
      }
    />
  );
};

const ChatHeaderMetaArea = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.title3};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const IntentTag = styled.span<{ $intentType: InquiryIntentType }>`
  display: inline-flex;
  ${({ theme }) => theme.fonts.labelXS};
  border-radius: 999px;
  padding: 4px 10px;

  ${({ $intentType, theme }) => {
    const colorKey = INQUIRY_INTENT_COLOR_KEY[$intentType];
    const color = theme.colors.intent[colorKey];

    return `
      border: 1px solid ${color.border};
      background: ${color.background};
      color: ${color.text};
    `;
  }}
`;

const StatusDropdownArea = styled.div`
  position: relative;
`;

const StatusMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 10;
  min-width: 92px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.card};
`;

const StatusMenuItem = styled(InlineButton)`
  width: 100%;
  justify-content: flex-start;
  border-radius: 0;
  padding: 8px 10px;
`;
