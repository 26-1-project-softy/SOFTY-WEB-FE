import styled from '@emotion/styled';
import { LandingFeatureSectionTitle } from '@/components/auth/landing/LandingSectionTitle';
import { LandingTextLines } from '@/components/auth/landing/LandingTextLines';
import type { LandingContent } from '@/constants/landing';

type LandingAiAnalysisSectionProps = {
  content: LandingContent['aiAnalysis'];
};

export const LandingAiAnalysisSection = ({ content }: LandingAiAnalysisSectionProps) => {
  return (
    <Section>
      <SectionInner>
        <SectionContent>
          <LandingFeatureSectionTitle
            featureLabel={content.featureLabel}
            sectionTitle={content.title.join('\n')}
          />

          {content.blocks.map(block => (
            <AiAnalysisBlock key={block.image.alt} $isImageLeft={block.isImageLeft}>
              <TextContainer $isImageLeft={block.isImageLeft}>
                <SubTitle>
                  <LandingTextLines lines={block.title} />
                </SubTitle>

                <Description>
                  <LandingTextLines lines={block.description} />
                </Description>
              </TextContainer>

              <ImageContainer $isImageLeft={block.isImageLeft}>
                <AiAnalysisImage src={block.image.src} alt={block.image.alt} />
              </ImageContainer>
            </AiAnalysisBlock>
          ))}
        </SectionContent>
      </SectionInner>
    </Section>
  );
};

const Section = styled.section`
  padding: 96px 16px;
  background: ${({ theme }) => theme.colors.background.bg1};

  @media (max-width: 768px) {
    padding: 72px 16px;
  }
`;

const SectionInner = styled.div`
  width: min(1140px, 80vw);
  margin: 0 auto;

  @media (max-width: 440px) {
    width: 100%;
  }
`;

const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 60px;
`;

const AiAnalysisBlock = styled.div<{ $isImageLeft?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $isImageLeft }) =>
    $isImageLeft ? 'minmax(0, 1fr) minmax(0, 360px)' : 'minmax(0, 360px) minmax(0, 1fr)'};
  align-items: center;
  gap: 48px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TextContainer = styled.div<{ $isImageLeft?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 24px;
  order: ${({ $isImageLeft }) => ($isImageLeft ? 2 : 1)};

  @media (max-width: 1024px) {
    order: 2;
  }
`;

const ImageContainer = styled.div<{ $isImageLeft?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  order: ${({ $isImageLeft }) => ($isImageLeft ? 1 : 2)};

  @media (max-width: 1024px) {
    order: 1;
  }
`;

const SubTitle = styled.h3`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.labelL};
  color: ${({ theme }) => theme.colors.text.text1};
`;

const Description = styled.p`
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text3};
`;

const AiAnalysisImage = styled.img`
  width: 100%;
  max-width: 560px;
  height: auto;
  object-fit: contain;
`;
