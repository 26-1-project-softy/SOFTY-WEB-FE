import styled from '@emotion/styled';
import type { ComponentType, SVGProps } from 'react';

export type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type IconProps = {
  symbol: IconComponent;
  size?: number;
  iconSize?: number;
  bgColor?: string;
  color?: string;
};

export const IconBadge = ({
  symbol: Symbol,
  size = 48,
  iconSize = 24,
  bgColor,
  color,
}: IconProps) => {
  return (
    <IconContainer $size={size} $bgColor={bgColor} $color={color}>
      <Symbol width={iconSize} height={iconSize} />
    </IconContainer>
  );
};

const IconContainer = styled.div<{ $size?: number; $bgColor?: string; $color?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ $size }) => `${$size}px`};
  aspect-ratio: 1;
  background-color: ${({ $bgColor }) => $bgColor};
  color: ${({ $color }) => $color};
  border-radius: 999px;
`;
