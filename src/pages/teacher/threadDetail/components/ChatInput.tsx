import styled from '@emotion/styled';
import { ChatComposer } from '@/components/common/chat/ChatComposer';
import { IcError } from '@/icons';

type ChatInputProps = {
  value: string;
  onChange: (value: string) => void;
  actionMode: 'assist' | 'send';
  isActionDisabled: boolean;
  onActionClick: () => void;
  errorMessage?: string;
};

export const ChatInput = ({
  value,
  onChange,
  actionMode,
  isActionDisabled,
  onActionClick,
  errorMessage,
}: ChatInputProps) => {
  return (
    <ComposerWrap>
      {errorMessage ? (
        <SendErrorBanner role="alert">
          <SendErrorIcon>
            <IcError />
          </SendErrorIcon>
          <SendErrorTextWrap>
            <SendErrorTitle>{errorMessage}</SendErrorTitle>
            <SendErrorDescription>잠시 후 다시 시도해 주세요.</SendErrorDescription>
          </SendErrorTextWrap>
        </SendErrorBanner>
      ) : null}

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
  background: ${({ theme }) => theme.colors.background.bg1};
  border-top: 1px solid ${({ theme }) => theme.colors.border.border1};
`;

const SendErrorBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.semantic.error};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.semantic.errorSoft};
  padding: 10px 12px;
`;

const SendErrorIcon = styled.span`
  display: inline-flex;
  color: ${({ theme }) => theme.colors.semantic.error};

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SendErrorTextWrap = styled.div`
  min-width: 0;
`;

const SendErrorTitle = styled.p`
  ${({ theme }) => theme.fonts.labelXS};
  margin: 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;

const SendErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.caption};
  margin: 2px 0 0;
  color: ${({ theme }) => theme.colors.semantic.error};
`;
