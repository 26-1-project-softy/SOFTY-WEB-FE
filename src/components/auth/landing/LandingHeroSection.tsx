import styled from '@emotion/styled';
import { LandingActionButtons } from '@/components/auth/landing/LandingActionButtons';
import { LandingTextLines } from '@/components/auth/landing/LandingTextLines';
import { HEADER_HEIGHT } from '@/constants/layout';
import type { LandingContent } from '@/constants/landing';

type LandingHeroSectionProps = {
  content: LandingContent['hero'];
  onOpenParentAppInstallDialog: () => void;
  onScrollToFeature: () => void;
};

export const LandingHeroSection = ({
  content,
  onOpenParentAppInstallDialog,
  onScrollToFeature,
}: LandingHeroSectionProps) => {
  return (
    <HeroSection>
      <HeroInner>
        <HeroTextContainer>
          <HeroTitle>
            <LandingTextLines lines={content.title} />{' '}
            <HeroHighlight>{content.highlightText}</HeroHighlight>
          </HeroTitle>

          <HeroDescription>
            <LandingTextLines lines={content.description} />
          </HeroDescription>

          <LandingActionButtons
            actions={content.actions}
            onOpenModal={onOpenParentAppInstallDialog}
            onScrollToFeature={onScrollToFeature}
          />
        </HeroTextContainer>

        <HeroImageContainer>
          <HeroImage src={content.image.src} alt={content.image.alt} />
        </HeroImageContainer>
      </HeroInner>
    </HeroSection>
  );
};

const HeroSection = styled.section`
  display: flex;
  align-items: center;
  background: ${({ theme }) => theme.colors.background.heroGradient};
  padding: ${HEADER_HEIGHT + 16}px 16px 80px;
`;

const HeroInner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: calc(100vh - ${HEADER_HEIGHT}px - 80px);
  margin: 0 auto;
  gap: 60px;
`;

const HeroTextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
`;

const HeroTitle = styled.h1`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.title1};
  color: ${({ theme }) => theme.colors.text.text1};

  @media (max-width: 768px) {
    ${({ theme }) => theme.fonts.title2};
  }
`;

const HeroHighlight = styled.span`
  color: ${({ theme }) => theme.colors.brand.primary};
`;

const HeroDescription = styled.p`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const HeroImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`;

const HeroImage = styled.img`
  display: block;
  width: 100%;
  max-width: 620px;
  height: auto;
  object-fit: contain;
`;
