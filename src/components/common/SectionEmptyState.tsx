import styled from '@emotion/styled';
import type { IconComponent } from '@/types/icon';
import { useTheme } from '@emotion/react';

type SectionEmptyStateProps = {
  icon: IconComponent;
  title?: string;
  description?: string;
};

export const SectionEmptyState = ({
  icon: Icon,
  title = '표시할 데이터가 없어요',
  description = '나중에 다시 확인해 주세요.',
}: SectionEmptyStateProps) => {
  const theme = useTheme();

  return (
    <Container>
      <Icon color={theme.colors.text.text4} />
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.text4};
  gap: 16px;
`;

const Title = styled.p`
  ${({ theme }) => theme.fonts.labelS};
`;

const Description = styled.p`
  ${({ theme }) => theme.fonts.body2};
`;
