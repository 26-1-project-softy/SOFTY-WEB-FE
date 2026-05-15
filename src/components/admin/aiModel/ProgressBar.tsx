import styled from '@emotion/styled';

type ProgressBarProps = {
  value: number;
  label?: string;
  valueLabel?: string;
};

const getSafeProgressValue = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

export const ProgressBar = ({ value, label = '진행률', valueLabel }: ProgressBarProps) => {
  const safeValue = getSafeProgressValue(value);
  const displayValue = valueLabel ?? `${safeValue}%`;

  return (
    <ProgressBarContainer>
      <ProgressMeta>
        <ProgressLabel>{label}</ProgressLabel>
        <ProgressValue>{displayValue}</ProgressValue>
      </ProgressMeta>

      <ProgressTrack
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safeValue}
      >
        <ProgressIndicator $value={safeValue} />
      </ProgressTrack>
    </ProgressBarContainer>
  );
};

const ProgressBarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProgressMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressLabel = styled.span`
  ${({ theme }) => theme.fonts.body3};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const ProgressValue = styled.span`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const ProgressTrack = styled.div`
  overflow: hidden;
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg3};
`;

const ProgressIndicator = styled.div<{ $value: number }>`
  width: ${({ $value }) => `${$value}%`};
  height: 100%;
  border-radius: inherit;
  background: ${({ theme }) => theme.colors.brand.primary};
  transition: width 0.3s ease;
`;
