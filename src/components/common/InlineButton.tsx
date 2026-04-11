import styled from '@emotion/styled';
import type { IconComponent } from '@/components/common/IconBadge';

type ButtonSize = 'M' | 'L';
type ButtonVariants = 'primary' | 'ghost' | 'text';

interface InlineButtonProps {
  variant: ButtonVariants;
  size: ButtonSize;
  icon?: IconComponent;
  width?: string; // 버튼 너비 지정
  label: string; // 버튼 라벨 텍스트
  disabled?: boolean;
  onClick?: () => void;
}

export const InlineButton = ({
  variant,
  size,
  icon: Icon,
  width,
  label,
  disabled,
  onClick,
}: InlineButtonProps) => {
  return (
    <ButtonContainer
      $variant={variant}
      $size={size}
      $width={width}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon />}
      <ButtonLabel>{label}</ButtonLabel>
    </ButtonContainer>
  );
};

const ButtonContainer = styled.button<{
  $size: ButtonSize;
  $width?: string;
  $variant: ButtonVariants;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${({ $width }) => ($width ? $width : '')};
  height: ${({ $size }) => ($size === 'M' ? '32px' : '40px')};
  background-color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.colors.brand.primary : theme.colors.background.bg1};
  color: ${({ $variant, theme }) =>
    $variant === 'primary' ? theme.colors.text.textW : theme.colors.text.text1};
  border: ${({ $variant, theme }) =>
    $variant === 'ghost' ? `1px solid ${theme.colors.border.border1}` : 'none'};
  border-radius: 10px;
  margin: 0 auto;
  padding: 12px;
  gap: 10px;

  &:hover,
  &:focus,
  &:active {
    background-color: ${({ $variant, theme }) =>
      $variant === 'primary'
        ? theme.colors.background.brandHover
        : $variant === 'ghost'
          ? theme.colors.background.bg1
          : 'transparent'};
    border: ${({ $variant, theme }) =>
      $variant === 'ghost' ? `1px solid ${theme.colors.border.border1}` : 'none'};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.background.bg5};
    color: ${({ theme }) => theme.colors.text.text4};
  }
`;

const ButtonLabel = styled.span`
  font: ${({ theme }) => theme.fonts.labelXS};
`;
