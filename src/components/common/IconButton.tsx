import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { ButtonHTMLAttributes } from 'react';
import type { IconComponent } from '@/types/icon';

type IconButtonVariant = 'primary' | 'ghost' | 'plain';

type IconButtonProps = {
  icon: IconComponent;
  variant: IconButtonVariant;
  accessibilityLabel?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const IconButton = ({
  icon: Icon,
  variant,
  disabled = false,
  accessibilityLabel,
  ...buttonProps
}: IconButtonProps) => {
  const theme = useTheme();

  const iconColor = disabled
    ? theme.colors.text.text4
    : variant === 'primary'
      ? theme.colors.text.textW
      : theme.colors.text.text1;

  return (
    <ButtonContainer
      type="button"
      $variant={variant}
      disabled={disabled}
      aria-label={accessibilityLabel}
      {...buttonProps}
    >
      <Icon color={iconColor} />
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button<{ $variant: IconButtonVariant }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 40px;
  height: 40px;
  background-color: ${({ theme, $variant }) =>
    $variant === 'primary'
      ? theme.colors.brand.primary
      : $variant === 'ghost'
        ? theme.colors.background.bg1
        : 'transparent'};
  border-radius: 999px;
  border: ${({ theme, $variant }) =>
    $variant === 'ghost' ? `1px solid ${theme.colors.border.border1}` : 'none'};
  transition:
    background-color 0.2s ease,
    opacity 0.2s ease;

  &:hover:not(:disabled),
  &:active:not(:disabled) {
    background-color: ${({ theme, $variant }) =>
      $variant === 'primary' ? theme.colors.brand.primary : theme.colors.background.bg5};
    opacity: ${({ $variant }) => ($variant === 'primary' ? 0.85 : 1)};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.bg1};
  }
`;
