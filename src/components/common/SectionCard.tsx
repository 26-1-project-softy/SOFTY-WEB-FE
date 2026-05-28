import styled from '@emotion/styled';
import type { PropsWithChildren, ReactNode } from 'react';

type SectionCardProps = PropsWithChildren<{
  title: string;
  description?: string;
  headerAction?: ReactNode;
}>;

export const SectionCard = ({ title, description, headerAction, children }: SectionCardProps) => {
  return (
    <SectionCardContainer>
      <SectionCardHeader>
        <SectionCardTextArea>
          <SectionCardTitle>{title}</SectionCardTitle>
          {description ? <SectionCardDescription>{description}</SectionCardDescription> : null}
        </SectionCardTextArea>

        {headerAction ? <SectionCardActionArea>{headerAction}</SectionCardActionArea> : null}
      </SectionCardHeader>

      {children}
    </SectionCardContainer>
  );
};

export const SectionCardContent = ({ children }: PropsWithChildren) => {
  return <CardContentContainer>{children}</CardContentContainer>;
};

const SectionCardContainer = styled.section`
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.background.bg1};
  box-shadow: ${({ theme }) => theme.colors.shadow.card};
`;

const SectionCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 20px;
  gap: 16px;
`;

const SectionCardTextArea = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 4px;
`;

const SectionCardTitle = styled.h2`
  ${({ theme }) => theme.fonts.labelM};
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.labelS};
  }
`;

const SectionCardDescription = styled.p`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.caption};
  color: ${({ theme }) => theme.colors.text.text4};
`;

const SectionCardActionArea = styled.div`
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
`;

const CardContentContainer = styled.div`
  padding: 16px 20px;
`;
