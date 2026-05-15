import styled from '@emotion/styled';
import { InlineButton } from '@/components/common/InlineButton';
import { IcError, IcRefresh } from '@/icons';
import type { IconComponent } from '@/types/icon';

type SectionErrorStateProps = {
  title?: string;
  description?: string;
  retryLabel?: string;
  retryIcon?: IconComponent;
  onRetry: () => void;
};

export const SectionErrorState = ({
  title = '정보를 불러올 수 없어요.',
  description = '잠시 후 다시 시도해주세요.',
  retryLabel = '다시 시도',
  retryIcon = IcRefresh,
  onRetry,
}: SectionErrorStateProps) => {
  return (
    <SectionErrorStateContainer>
      <SectionErrorIcon>
        <IcError width={30} height={30} />
      </SectionErrorIcon>
      <SectionErrorTitle>{title}</SectionErrorTitle>
      <SectionErrorDescription>{description}</SectionErrorDescription>
      <InlineButton
        type="button"
        variant="primary"
        size="L"
        icon={retryIcon}
        label={retryLabel}
        onClick={onRetry}
      />
    </SectionErrorStateContainer>
  );
};

const SectionErrorStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const SectionErrorIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.semantic.error};
  flex-shrink: 0;
`;

const SectionErrorTitle = styled.h2`
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const SectionErrorDescription = styled.p`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text1};
`;
