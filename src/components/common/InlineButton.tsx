import styled from '@emotion/styled';
import type { IconComponent } from '@/components/common/IconBadge';
import { useTheme } from '@emotion/react';

type ButtonSize = 'M' | 'L';
type ButtonVariants = 'primary' | 'ghost' | 'text';

interface InlineButtonProps {
  variant: ButtonVariants;
  size: ButtonSize;
  icon?: IconComponent;
  width?: string; // 버튼 너비 지정
  label: string; // 버튼 라벨 텍스트
  bgColor?: string;
  activeBgColor?: string;
  color?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const InlineButton = ({
  variant,
  size,
  icon: Icon,
  width,
  label,
  bgColor,
  activeBgColor,
  color,
  disabled,
  onClick,
}: InlineButtonProps) => {
  const theme = useTheme();

  const contentColor = disabled
    ? theme.colors.text.text4
    : color
      ? color
      : variant === 'primary'
        ? theme.colors.text.textW
        : theme.colors.text.text1;

  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $width={width}
      $bgColor={bgColor}
      $activeBgColor={activeBgColor}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon color={contentColor} />}
      <ButtonLabel $color={contentColor}>{label}</ButtonLabel>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button<{
  $size: ButtonSize;
  $width?: string;
  $bgColor?: string;
  $activeBgColor?: string;
  $variant: ButtonVariants;
}>`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: ${({ $width }) => ($width ? $width : 'auto')};
  height: ${({ $size }) => ($size === 'M' ? '34px' : '42px')};
  background-color: ${({ $variant, theme, $bgColor }) =>
    $bgColor
      ? $bgColor
      : $variant === 'primary'
        ? theme.colors.brand.primary
        : $variant === 'ghost'
          ? theme.colors.background.bg1
          : 'transparent'};
  color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.colors.text.textW : theme.colors.text.text1};
  border: ${({ $variant, theme }) =>
    $variant === 'ghost' ? `1px solid ${theme.colors.border.border1}` : 'none'};
  border-radius: 10px;
  padding: 12px;
  gap: 10px;

  &:hover,
  &:active {
    background-color: ${({ $variant, theme, $activeBgColor }) =>
      $activeBgColor
        ? $activeBgColor
        : $variant === 'primary'
          ? theme.colors.background.brandHover
          : theme.colors.background.bg5};
    border: ${({ $variant, theme }) =>
      $variant === 'ghost' ? `1px solid ${theme.colors.border.border1}` : 'none'};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.brand.primary};
    outline-offset: 2px;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.bg5};
    color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const ButtonLabel = styled.span<{ $color: string }>`
  white-space: nowrap;
  ${({ theme }) => theme.fonts.labelXS};
  color: ${({ $color }) => $color};
`;
