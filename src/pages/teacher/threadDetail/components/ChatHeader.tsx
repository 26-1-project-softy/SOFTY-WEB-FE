import styled from '@emotion/styled';
import { IconButton } from '@/components/common/IconButton';
import { InlineButton } from '@/components/common/InlineButton';
import { StatusTagButton, type StatusTagTone } from '@/components/common/chat/StatusTagButton';
import { IcBack } from '@/icons';
import type { ThreadStatus } from '@/stores/threadStatusStore';

type ChatHeaderProps = {
  counterpartName: string;
  studentName: string;
  intentLabel: string;
  statusLabel: string;
  statusTone: StatusTagTone;
  isStatusMenuOpen: boolean;
  onBack: () => void;
  onToggleStatusMenu: () => void;
  onSelectStatus: (status: ThreadStatus) => void;
};

export const ChatHeader = ({
  counterpartName,
  studentName,
  intentLabel,
  statusLabel,
  statusTone,
  isStatusMenuOpen,
  onBack,
  onToggleStatusMenu,
  onSelectStatus,
}: ChatHeaderProps) => {
  return (
    <ThreadHeader>
      <BackButtonWrap>
        <IconButton
          icon={IcBack}
          variant="plain"
          accessibilityLabel="수신함으로 이동"
          onClick={onBack}
        />
      </BackButtonWrap>

      <HeaderInfo>
        <ParentName>{counterpartName || '-'}</ParentName>
        <StudentName>{studentName || '-'}</StudentName>
        <StatusTagButton label={intentLabel || '-'} tone="absence" />

        <StatusDropdownWrap>
          <StatusTagButton
            label={statusLabel}
            tone={statusTone}
            isDropdown
            onClick={onToggleStatusMenu}
          />

          {isStatusMenuOpen ? (
            <StatusMenu>
              <StatusMenuItem
                variant="text"
                size="M"
                label="처리중"
                onClick={() => onSelectStatus('processing')}
              />
              <StatusMenuItem
                variant="text"
                size="M"
                label="완료"
                onClick={() => onSelectStatus('done')}
              />
            </StatusMenu>
          ) : null}
        </StatusDropdownWrap>
      </HeaderInfo>
    </ThreadHeader>
  );
};

const ThreadHeader = styled.header`
  height: 84px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.border1};
  background: ${({ theme }) => theme.colors.background.bg1};
`;

const BackButtonWrap = styled.div`
  button {
    width: 32px;
    height: 32px;
  }
`;

const HeaderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const ParentName = styled.h2`
  ${({ theme }) => theme.fonts.titleM};
  margin: 0;
  color: ${({ theme }) => theme.colors.text.text1};
`;

const StudentName = styled.span`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const StatusDropdownWrap = styled.div`
  position: relative;
`;

const StatusMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 92px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.card};
  overflow: hidden;
  z-index: 10;
`;

const StatusMenuItem = styled(InlineButton)`
  width: 100%;
  justify-content: flex-start;
  border-radius: 0;
  padding: 8px 10px;
`;
