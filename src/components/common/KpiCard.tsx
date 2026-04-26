import styled from '@emotion/styled';

type KpiCardProps = {
  title: string;
  value: string;
};

export const KpiCard = ({ title, value }: KpiCardProps) => {
  return (
    <KpiCardContainer>
      <KpiTitle>{title}</KpiTitle>
      <KpiValue>{value}</KpiValue>
    </KpiCardContainer>
  );
};

const KpiCardContainer = styled.article`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border.border2};
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  padding: 20px;
`;

const KpiTitle = styled.h3`
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.labelS};
  }
`;

const KpiValue = styled.p`
  ${({ theme }) => theme.fonts.labelL};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.labelM};
  }
`;
