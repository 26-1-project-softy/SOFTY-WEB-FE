import styled from '@emotion/styled';

type InfoField = {
  label: string;
  value: string;
};

type InfoFieldGridProps = {
  fields: InfoField[];
};

export const InfoFieldGrid = ({ fields }: InfoFieldGridProps) => {
  return (
    <InfoGrid>
      {fields.map(field => (
        <InfoFieldItem key={field.label}>
          <InfoLabel>{field.label}</InfoLabel>
          <InfoValue title={field.value}>{field.value}</InfoValue>
        </InfoFieldItem>
      ))}
    </InfoGrid>
  );
};

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 393px) {
    grid-template-columns: 1fr;
  }
`;

const InfoFieldItem = styled.div`
  display: flex;
  min-width: 0;
  flex-direction: column;
  padding: 0 12px;
  gap: 10px;
`;

const InfoLabel = styled.span`
  ${({ theme }) => theme.fonts.body2};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const InfoValue = styled.p`
  overflow-wrap: anywhere;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.labelM};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.labelS};
  }
`;
