import styled from '@emotion/styled';
import type { IconComponent } from '@/types/icon';

type IconBadgeProps = {
  icon: IconComponent;
  size?: number;
  iconSize?: number;
  bgColor: string;
  color: string;
};

export const IconBadge = ({
  icon: Icon,
  size = 68,
  iconSize = 34,
  bgColor,
  color,
}: IconBadgeProps) => {
  return (
    <IconBadgeContainer $size={size} $bgColor={bgColor} $color={color} aria-hidden="true">
      <Icon width={iconSize} height={iconSize} />
    </IconBadgeContainer>
  );
};

const IconBadgeContainer = styled.span<{
  $size: number;
  $bgColor: string;
  $color: string;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: 999px;
  background-color: ${({ $bgColor }) => $bgColor};
  color: ${({ $color }) => $color};
  flex-shrink: 0;
`;
