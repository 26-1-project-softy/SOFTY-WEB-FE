import type { Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { IcError, IcInfo } from '@/icons';
import { InlineButton } from '@/components/common/InlineButton';

type AlertVariant = 'error' | 'warning' | 'success';

type AlertProps = {
  title: string;
  description?: string;
  variant?: AlertVariant;
  onRetry?: () => void;
};

export const Alert = ({ title, description, variant = 'error', onRetry }: AlertProps) => {
  const alertRole = variant === 'success' ? 'status' : 'alert';

  return (
    <AlertContainer role={alertRole} aria-live="polite" $variant={variant}>
      <AlertContentContainer>
        <AlertIconContainer $variant={variant}>
          {variant === 'success' ? (
            <IcInfo width={18} height={18} />
          ) : (
            <IcError width={18} height={18} />
          )}
        </AlertIconContainer>

        <AlertTextContainer>
          <AlertTitle $variant={variant}>{title}</AlertTitle>
          {description && <AlertDescription $variant={variant}>{description}</AlertDescription>}
        </AlertTextContainer>
      </AlertContentContainer>

      {onRetry && <InlineButton variant="ghost" size="L" label="다시 시도" onClick={onRetry} />}
    </AlertContainer>
  );
};

const getAlertVariantStyle = (theme: Theme, variant: AlertVariant) => {
  if (variant === 'error') {
    return {
      backgroundColor: theme.colors.semantic.errorSoft,
      borderColor: theme.colors.semantic.error,
      contentColor: theme.colors.semantic.error,
    };
  }

  if (variant === 'warning') {
    return {
      backgroundColor: theme.colors.semantic.warningSoft,
      borderColor: theme.colors.semantic.warning,
      contentColor: theme.colors.semantic.warning,
    };
  }

  return {
    backgroundColor: theme.colors.semantic.successSoft,
    borderColor: theme.colors.semantic.success,
    contentColor: theme.colors.semantic.success,
  };
};

const AlertContainer = styled.div<{ $variant: AlertVariant }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${({ theme, $variant }) => getAlertVariantStyle(theme, $variant).borderColor};
  border-radius: 16px;
  background: ${({ theme, $variant }) => getAlertVariantStyle(theme, $variant).backgroundColor};
  padding: 12px 16px;
  gap: 16px;
`;

const AlertContentContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
`;

const AlertIconContainer = styled.div<{ $variant: AlertVariant }>`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $variant }) => getAlertVariantStyle(theme, $variant).contentColor};
`;

const AlertTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const AlertTitle = styled.p<{ $variant: AlertVariant }>`
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ theme, $variant }) => getAlertVariantStyle(theme, $variant).contentColor};
  overflow-wrap: break-word;
  word-break: keep-all;
`;

const AlertDescription = styled.p<{ $variant: AlertVariant }>`
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme, $variant }) => getAlertVariantStyle(theme, $variant).contentColor};
  overflow-wrap: break-word;
  word-break: keep-all;
`;
