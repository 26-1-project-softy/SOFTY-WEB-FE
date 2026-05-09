import styled from '@emotion/styled';
import { ChatComposer } from '@/components/common/chat/ChatComposer';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  actionMode: 'assist' | 'send';
  isActionDisabled: boolean;
  onActionClick: () => void;
};

export const ChatInput = ({
  value,
  onChange,
  actionMode,
  isActionDisabled,
  onActionClick,
}: ChatInputProps) => {
  return (
    <ComposerWrap>
      <ChatComposer
        value={value}
        onChange={onChange}
        actionMode={actionMode}
        isActionDisabled={isActionDisabled}
        onActionClick={onActionClick}
      />
    </ComposerWrap>
  );
};

const ComposerWrap = styled.div`
  padding: 12px;
  background: ${({ theme }) => theme.colors.background.bg2};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;
