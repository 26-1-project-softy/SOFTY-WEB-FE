import styled from '@emotion/styled';
import { LandingFeatureSectionTitle } from '@/components/auth/landing/LandingSectionTitle';
import { LandingTextLines } from '@/components/auth/landing/LandingTextLines';
import type { LandingContent } from '@/constants/landing';

type LandingReportSectionProps = {
  content: LandingContent['report'];
};

export const LandingReportSection = ({ content }: LandingReportSectionProps) => {
  return (
    <Section>
      <SectionInner>
        <SectionContent>
          <LandingFeatureSectionTitle
            featureLabel={content.featureLabel}
            sectionTitle={content.title.join('\n')}
          />

          <ReportLayout>
            <LeftDescriptionBlock>
              <Description>
                <LandingTextLines lines={content.leftDescription} />
              </Description>
            </LeftDescriptionBlock>

            <ImageContainer>
              <ReportImage src={content.image.src} alt={content.image.alt} />
            </ImageContainer>

            <RightDescriptionBlock>
              <Description>
                <LandingTextLines lines={content.rightDescription} />
              </Description>
            </RightDescriptionBlock>
          </ReportLayout>
        </SectionContent>
      </SectionInner>
    </Section>
  );
};

const Section = styled.section`
  padding: 96px 16px;
  background: ${({ theme }) => theme.colors.background.bg2};

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

const ReportLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 600px) minmax(0, 1fr);
  align-items: start;
  gap: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const LeftDescriptionBlock = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;

  @media (max-width: 1024px) {
    justify-content: flex-start;
    padding-top: 0;
  }
`;

const RightDescriptionBlock = styled.div`
  display: flex;
  justify-content: flex-start;
  padding-top: 8px;

  @media (max-width: 1024px) {
    justify-content: flex-start;
    padding-top: 0;
  }
`;

const Description = styled.p`
  width: 100%;
  max-width: 220px;
  word-break: keep-all;
  ${({ theme }) => theme.fonts.body1};
  color: ${({ theme }) => theme.colors.text.text3};

  @media (max-width: 1024px) {
    max-width: none;
  }
`;

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
`;

const ReportImage = styled.img`
  display: block;
  width: 100%;
  max-width: 600px;
  height: auto;
  object-fit: contain;
`;
