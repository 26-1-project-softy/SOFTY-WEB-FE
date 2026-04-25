import styled from '@emotion/styled';
import { KakaoLoginButton } from '@/components/auth/landing/KakaoLoginButton';
import { InlineButton } from '@/components/common/InlineButton';
import type { LandingAction, LandingActionType } from '@/constants/landing';
import { IcDownload } from '@/icons';

type LandingActionButtonsProps = {
  actions: LandingAction[];
  align?: 'left' | 'center';
  onOpenModal: () => void;
  onScrollToFeature: () => void;
};

export const LandingActionButtons = ({
  actions,
  align = 'left',
  onOpenModal,
  onScrollToFeature,
}: LandingActionButtonsProps) => {
  const handleClickAction = (actionType: LandingActionType) => {
    switch (actionType) {
      case 'teacherLogin':
        return;
      case 'openParentAppInstallDialog':
        onOpenModal();
        return;
      case 'scrollToFeature':
        onScrollToFeature();
        return;
      default:
        return;
    }
  };

  return (
    <ButtonGroup $align={align}>
      {actions.map(action => {
        if (action.variant === 'kakao') {
          return <KakaoLoginButton key={action.key} />;
        }

        return (
          <InlineButton
            key={action.key}
            variant={action.variant}
            size="L"
            label={action.label}
            icon={action.actionType === 'openParentAppInstallDialog' ? IcDownload : undefined}
            onClick={() => handleClickAction(action.actionType)}
          />
        );
      })}
    </ButtonGroup>
  );
};

const ButtonGroup = styled.div<{ $align: 'left' | 'center' }>`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'flex-start')};
  gap: 10px;

  @media (max-width: 640px) {
    width: 100%;
    justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'flex-start')};
  }
`;
