import styled from '@emotion/styled';
import { IconButton } from '@/components/common/IconButton';
import { InlineButton } from '@/components/common/InlineButton';
import { StatusTagButton } from '@/components/teacher/threadDetail/StatusTagButton';
import {
  INQUIRY_INTENT_COLOR_KEY,
  INQUIRY_INTENT_LABEL,
  type InquiryIntentType,
} from '@/constants/inquiryIntent';
import { INQUIRY_STATUS, INQUIRY_STATUS_LABEL } from '@/constants/inquiryStatus';
import { IcBack } from '@/icons';
import type { ThreadStatus } from '@/stores/threadStatusStore';

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
  return (
    <ThreadHeader>
      <BackButtonArea>
        <IconButton
          icon={IcBack}
          variant="plain"
          accessibilityLabel="수신함으로 이동"
          onClick={onBack}
        />
      </BackButtonArea>

      <HeaderInfo>
        <ParentName>{counterpartName || '-'}</ParentName>
        <StudentName>{studentName || '-'}</StudentName>

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
      </HeaderInfo>
    </ThreadHeader>
  );
};

const ThreadHeader = styled.header`
  display: flex;
  height: 84px;
  align-items: center;
  padding: 0 20px;
  gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const BackButtonArea = styled.div`
  button {
    width: 32px;
    height: 32px;
  }
`;

const HeaderInfo = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 10px;
`;

const ParentName = styled.h2`
  ${({ theme }) => theme.fonts.title2};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.title3};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const IntentTag = styled.span<{ $intentType: InquiryIntentType }>`
  ${({ theme }) => theme.fonts.labelXS};
  display: inline-flex;
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
