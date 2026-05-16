import styled from '@emotion/styled';
import { IconButton } from '@/components/common/IconButton';
import { IcSend, IcSparkles } from '@/icons';

type ComposerActionMode = 'assist' | 'send';

type ChatComposerProps = {
  value: string;
  placeholder?: string;
  onChange: (nextValue: string) => void;
  onActionClick?: () => void;
  actionMode?: ComposerActionMode;
  isActionDisabled?: boolean;
};

export const ChatComposer = ({
  value,
  placeholder = '학부모님께 전달할 답변을 작성해주세요.',
  onChange,
  onActionClick,
  actionMode = 'assist',
  isActionDisabled = false,
}: ChatComposerProps) => {
  const actionIcon = actionMode === 'send' ? IcSend : IcSparkles;
  const actionLabel = actionMode === 'send' ? '메시지 전송' : 'AI 소통 어시스턴트';

  return (
    <ComposerContainer>
      <ComposerTextarea
        value={value}
        placeholder={placeholder}
        onChange={event => onChange(event.target.value)}
      />
      <ActionButtonWrap>
        <IconButton
          icon={actionIcon}
          variant="primary"
          accessibilityLabel={actionLabel}
          disabled={isActionDisabled}
          onClick={onActionClick}
        />
      </ActionButtonWrap>
    </ComposerContainer>
  );
};

const ComposerContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.border1};
  border-radius: 18px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 14px 16px;
`;

const ComposerTextarea = styled.textarea`
  ${({ theme }) => theme.fonts.body2};
  flex: 1;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.text.text1};
  resize: none;
  min-height: 84px;
  max-height: 132px;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.text4};
  }

  &:focus {
    outline: none;
  }
`;

const ActionButtonWrap = styled.div`
  button {
    width: 44px;
    height: 44px;
  }
`;
