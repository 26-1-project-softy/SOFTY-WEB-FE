import styled from '@emotion/styled';

interface AvatarProps {
  size?: number;
  lastName: string;
}

export const Avatar = ({ size = 36, lastName }: AvatarProps) => {
  return <AvatarContainer $size={size}>{lastName}</AvatarContainer>;
};

const AvatarContainer = styled.span<{ $size: number }>`
  ${({ theme }) => theme.fonts.labelXS};
  width: ${({ $size }) => `${$size}px`};
  height: ${({ $size }) => `${$size}px`};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.background.bg4};
  color: ${({ theme }) => theme.colors.brand.dark};
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
