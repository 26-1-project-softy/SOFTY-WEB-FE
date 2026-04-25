import styled from '@emotion/styled';

type LandingFeatureSectionTitleProps = {
  featureLabel: string;
  sectionTitle: string;
};

export const LandingFeatureSectionTitle = ({
  featureLabel,
  sectionTitle,
}: LandingFeatureSectionTitleProps) => {
  return (
    <FeatureSectionTitleContainer>
      <FeatureLabel>{featureLabel}</FeatureLabel>
      <FeatureSectionTitle>{sectionTitle}</FeatureSectionTitle>
    </FeatureSectionTitleContainer>
  );
};

const FeatureSectionTitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const FeatureLabel = styled.p`
  white-space: pre-wrap;
  ${({ theme }) => theme.fonts.labelS};
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const FeatureSectionTitle = styled.h1`
  white-space: pre-wrap;
  ${({ theme }) => theme.fonts.title1};
  color: ${({ theme }) => theme.colors.text.text1};
`;
